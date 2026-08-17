import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCode, formatJobCodeWithSO, formatSubContractCodeWithSO } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const companyCode = searchParams.get('companyCode');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (companyId && companyId !== 'all') where.companyId = companyId;
    if (companyCode && companyCode !== 'all') {
      where.company = { code: companyCode };
    }
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { jobCode: { contains: search } },
        { title: { contains: search } },
        { customerName: { contains: search } },
        { siteLocation: { contains: search } },
        {
          subContracts: {
            some: {
              subcontractor: {
                name: { contains: search },
              },
            },
          },
        },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
        subContracts: {
          include: {
            subcontractor: true,
            items: true,
            payments: {
              orderBy: { installmentNo: 'asc' },
            },
          },
        },
      },
    });

    // Compute financial summary for each job
    const jobsWithFinancials = jobs.map((job) => {
      let totalJobContractAmount = 0;
      let totalJobPaidAmount = 0;
      let totalJobExtraAmount = 0;
      let totalJobDeductAmount = 0;

      const contracts = job.subContracts.map((contract) => {
        const netContract = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
        const totalPaid = contract.payments
          .filter((p) => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);
        const remainingBalance = Math.max(0, netContract - totalPaid);
        const paymentProgress = netContract > 0 ? Math.min(100, Math.round((totalPaid / netContract) * 100)) : 0;

        totalJobContractAmount += contract.totalContractAmount;
        totalJobExtraAmount += contract.extraAmount;
        totalJobDeductAmount += contract.deductAmount;
        totalJobPaidAmount += totalPaid;

        return {
          ...contract,
          netContractAmount: netContract,
          totalPaid,
          remainingBalance,
          paymentProgress,
        };
      });

      const netJobAmount = totalJobContractAmount + totalJobExtraAmount - totalJobDeductAmount;
      const jobRemainingBalance = Math.max(0, netJobAmount - totalJobPaidAmount);
      const jobProgress = netJobAmount > 0 ? Math.min(100, Math.round((totalJobPaidAmount / netJobAmount) * 100)) : 0;

      return {
        ...job,
        subContracts: contracts,
        financials: {
          totalContractAmount: totalJobContractAmount,
          extraAmount: totalJobExtraAmount,
          deductAmount: totalJobDeductAmount,
          netJobAmount,
          totalPaidAmount: totalJobPaidAmount,
          remainingBalance: jobRemainingBalance,
          progress: jobProgress,
        },
      };
    });

    return NextResponse.json(jobsWithFinancials);
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId,
      soNumber,
      title,
      customerName,
      customerPhone,
      siteLocation,
      startDate,
      endDate,
      notes,
      contracts, // Array of { subcontractorId, items: [ { itemId, itemCode, itemName, quantity, unit, unitRate, notes } ], notes, extraAmount, deductAmount }
    } = body;

    if (!companyId || !title) {
      return NextResponse.json({ error: 'กรุณาระบุบริษัทและชื่องานติดตั้ง' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: 'ไม่พบบริษัทที่ระบุ' }, { status: 404 });
    }

    // 1. Generate sequential Job Code [COMP_CODE]-[SO_NO] or [COMP_CODE]-JOB-YYYYMM-XXXX
    const date = new Date();
    const jobCount = await prisma.job.count({
      where: { companyId: company.id },
    });
    const jobCode = formatJobCodeWithSO(company.code, jobCount + 1, soNumber, date);

    // 2. Create Job
    const createdJob = await prisma.job.create({
      data: {
        companyId: company.id,
        jobCode,
        title: title.trim(),
        customerName: customerName?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        siteLocation: siteLocation?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes?.trim() || null,
        status: 'IN_PROGRESS',
      },
    });

    // 3. Create SubContracts & Multi-Items
    if (contracts && Array.isArray(contracts) && contracts.length > 0) {
      let contractSeq = 1;

      for (const c of contracts) {
        if (!c.subcontractorId) continue;

        const scCode = formatSubContractCodeWithSO(company.code, jobCount * 10 + contractSeq, soNumber, contractSeq, date);
        contractSeq++;

        const itemsData = (c.items || []).map((item: any) => {
          const qty = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.unitRate) || 0;
          return {
            itemId: item.itemId || null,
            itemCode: item.itemCode?.trim() || 'ITEM-GEN',
            itemName: item.itemName?.trim() || 'งานติดตั้ง',
            quantity: qty,
            unit: item.unit?.trim() || 'หน่วย',
            unitRate: rate,
            totalAmount: qty * rate,
            notes: item.notes?.trim() || null,
          };
        });

        // Total Contract Amount = Sum of items
        const totalContractAmount = itemsData.reduce((sum: number, it: any) => sum + it.totalAmount, 0);

        const subContract = await prisma.subContract.create({
          data: {
            jobId: createdJob.id,
            subcontractorId: c.subcontractorId,
            contractCode: scCode,
            contractDate: new Date(),
            totalContractAmount,
            extraAmount: parseFloat(c.extraAmount) || 0,
            deductAmount: parseFloat(c.deductAmount) || 0,
            notes: c.notes?.trim() || null,
            status: 'ACTIVE',
            items: {
              create: itemsData,
            },
          },
        });

        // Record unit rates into ItemRateHistory for price benchmarking
        for (const it of itemsData) {
          if (it.itemId && it.unitRate > 0) {
            await prisma.itemRateHistory.create({
              data: {
                itemId: it.itemId,
                subcontractorId: c.subcontractorId,
                unitRate: it.unitRate,
                jobCode: createdJob.jobCode,
                jobTitle: createdJob.title,
                notes: `สัญญา ${scCode} (${it.quantity} ${it.unit})`,
              },
            });
          }
        }
      }
    }

    return NextResponse.json(createdJob, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: error.message || 'Failed to create job' }, { status: 500 });
  }
}
