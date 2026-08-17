import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const companyCode = searchParams.get('companyCode');

    const jobWhere: any = {};
    const qtWhere: any = {};

    if (companyId && companyId !== 'all') {
      jobWhere.companyId = companyId;
      qtWhere.companyId = companyId;
    }
    if (companyCode && companyCode !== 'all') {
      jobWhere.company = { code: companyCode };
      qtWhere.company = { code: companyCode };
    }

    // 1. Fetch Companies for consolidated breakdown
    const companies = await prisma.company.findMany({
      orderBy: { code: 'asc' },
    });

    // 2. Fetch Jobs with contracts, items, payments
    const jobs = await prisma.job.findMany({
      where: jobWhere,
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
      orderBy: { createdAt: 'desc' },
    });

    // 3. Subcontractors count and pending verification count
    const totalSubcontractors = await prisma.subcontractor.count();
    const pendingIdVerificationCount = await prisma.subcontractor.count({
      where: { idCardStatus: 'PENDING_ATTACHMENT' },
    });

    // 4. Quotations count
    const totalQuotations = await prisma.subQuotation.count({
      where: qtWhere,
    });
    const draftQuotations = await prisma.subQuotation.count({
      where: { ...qtWhere, status: 'DRAFT' },
    });

    // 5. Aggregate Financial Metrics
    let totalContractValue = 0;
    let totalPaidValue = 0;
    let totalExtraValue = 0;
    let totalDeductValue = 0;
    let activeJobsCount = 0;
    let completedJobsCount = 0;

    const pendingPaymentsList: any[] = [];

    for (const job of jobs) {
      if (job.status === 'COMPLETED') completedJobsCount++;
      else if (job.status === 'IN_PROGRESS') activeJobsCount++;

      for (const contract of job.subContracts) {
        const netContract = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
        const paid = contract.payments
          .filter((p) => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);
        const remaining = Math.max(0, netContract - paid);

        totalContractValue += contract.totalContractAmount;
        totalExtraValue += contract.extraAmount;
        totalDeductValue += contract.deductAmount;
        totalPaidValue += paid;

        if (remaining > 0 && contract.status === 'ACTIVE') {
          pendingPaymentsList.push({
            contractId: contract.id,
            contractCode: contract.contractCode,
            jobId: job.id,
            jobCode: job.jobCode,
            jobTitle: job.title,
            companyCode: job.company.code,
            companyName: job.company.nameTh,
            subcontractor: {
              id: contract.subcontractor.id,
              name: contract.subcontractor.name,
              phone: contract.subcontractor.phone,
              bankName: contract.subcontractor.bankName,
              bankAccountNo: contract.subcontractor.bankAccountNo,
              idCardStatus: contract.subcontractor.idCardStatus,
            },
            netContractAmount: netContract,
            totalPaid: paid,
            remainingBalance: remaining,
            paidInstallmentsCount: contract.payments.length,
            itemsCount: contract.items.length,
          });
        }
      }
    }

    const netTotalContractValue = totalContractValue + totalExtraValue - totalDeductValue;
    const totalOutstandingBalance = Math.max(0, netTotalContractValue - totalPaidValue);
    const overallPaymentProgress =
      netTotalContractValue > 0
        ? Math.min(100, Math.round((totalPaidValue / netTotalContractValue) * 100))
        : 0;

    // 6. Company Breakdown Metrics
    const companySummaries = companies.map((c) => {
      const companyJobs = jobs.filter((j) => j.companyId === c.id);
      let compContractVal = 0;
      let compPaidVal = 0;

      for (const j of companyJobs) {
        for (const sc of j.subContracts) {
          const net = sc.totalContractAmount + sc.extraAmount - sc.deductAmount;
          const paid = sc.payments
            .filter((p) => p.status === 'PAID')
            .reduce((sum, p) => sum + p.amount, 0);
          compContractVal += net;
          compPaidVal += paid;
        }
      }

      return {
        companyId: c.id,
        code: c.code,
        nameTh: c.nameTh,
        jobsCount: companyJobs.length,
        totalContractValue: compContractVal,
        totalPaidValue: compPaidVal,
        outstandingBalance: Math.max(0, compContractVal - compPaidVal),
      };
    });

    // 7. Recent Items Price Benchmarks summary
    const recentItems = await prisma.item.findMany({
      take: 6,
      include: {
        rateHistory: {
          include: {
            subcontractor: true,
          },
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    const itemBenchmarks = recentItems.map((it) => {
      const rates = it.rateHistory.map((r) => r.unitRate);
      const minRate = rates.length > 0 ? Math.min(...rates) : it.standardRate;
      const avgRate =
        rates.length > 0
          ? rates.reduce((a, b) => a + b, 0) / rates.length
          : it.standardRate;
      const lowestSub = it.rateHistory.find((r) => r.unitRate === minRate)?.subcontractor;

      return {
        id: it.id,
        code: it.code,
        name: it.name,
        unit: it.unit,
        standardRate: it.standardRate,
        minRate,
        avgRate: Math.round(avgRate * 100) / 100,
        lowestSubcontractorName: lowestSub ? lowestSub.name : null,
      };
    });

    return NextResponse.json({
      metrics: {
        totalJobs: jobs.length,
        activeJobsCount,
        completedJobsCount,
        totalSubcontractors,
        pendingIdVerificationCount,
        totalQuotations,
        draftQuotations,
        totalContractValue,
        totalExtraValue,
        totalDeductValue,
        netTotalContractValue,
        totalPaidValue,
        totalOutstandingBalance,
        overallPaymentProgress,
      },
      companySummaries,
      pendingPayments: pendingPaymentsList.sort((a, b) => b.remainingBalance - a.remainingBalance).slice(0, 10),
      recentJobs: jobs.slice(0, 5),
      itemBenchmarks,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
