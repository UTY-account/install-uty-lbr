import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCode, formatJobCodeWithSO, formatSubContractCodeWithSO } from '@/lib/utils';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await prisma.subQuotation.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        subcontractor: true,
        items: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'ไม่พบใบเสนอราคา' }, { status: 404 });
    }

    if (quotation.status === 'CONVERTED' && quotation.convertedJobId) {
      return NextResponse.json(
        { error: 'ใบเสนอราคานี้ถูกแปลงเป็นงานติดตั้งแล้ว', jobId: quotation.convertedJobId },
        { status: 400 }
      );
    }

    // Atomic transaction: Create Job, Create SubContract, Create SubContractItems, Log ItemRateHistory, Mark Quotation as CONVERTED
    const result = await prisma.$transaction(async (tx) => {
      const date = new Date();
      const jobCount = await tx.job.count({
        where: { companyId: quotation.companyId },
      });

      // Check if quotationNo contains SO pattern (e.g. CP1-QT-SO260817-0001-01 -> SO260817-0001)
      let extractedSO: string | null = null;
      let extractedSeq = 1;
      const soMatch = quotation.quotationNo.match(/QT-(SO[A-Za-z0-9-]+?)(?:-(\d{2}))?$/i);
      if (soMatch) {
        extractedSO = soMatch[1];
        if (soMatch[2]) extractedSeq = parseInt(soMatch[2]);
      }

      const jobCode = formatJobCodeWithSO(quotation.company.code, jobCount + 1, extractedSO, date);
      const scCode = formatSubContractCodeWithSO(quotation.company.code, jobCount * 10 + 1, extractedSO, extractedSeq, date);

      // 1. Create Job
      const createdJob = await tx.job.create({
        data: {
          companyId: quotation.companyId,
          jobCode,
          title: quotation.projectName,
          customerName: 'แปลงจากใบเสนอราคา ' + quotation.quotationNo,
          status: 'IN_PROGRESS',
          notes: `สร้างอัตโนมัติจากใบเสนอราคา ${quotation.quotationNo} โดย ${quotation.subcontractor.name}`,
        },
      });

      // 2. Prepare items
      const itemsData = quotation.items.map((it) => ({
        itemId: it.itemId,
        itemCode: it.itemCode,
        itemName: it.itemName,
        quantity: it.quantity,
        unit: it.unit,
        unitRate: it.unitRate,
        totalAmount: it.totalAmount,
        notes: it.notes,
      }));

      // 3. Create SubContract
      const createdContract = await tx.subContract.create({
        data: {
          jobId: createdJob.id,
          subcontractorId: quotation.subcontractorId,
          contractCode: scCode,
          contractDate: new Date(),
          totalContractAmount: quotation.subtotal,
          extraAmount: 0,
          deductAmount: 0,
          status: 'ACTIVE',
          notes: `อ้างอิงใบเสนอราคา ${quotation.quotationNo}`,
          items: {
            create: itemsData,
          },
        },
      });

      // 4. Record Unit Rate History for benchmarking
      for (const it of quotation.items) {
        if (it.itemId && it.unitRate > 0) {
          await tx.itemRateHistory.create({
            data: {
              itemId: it.itemId,
              subcontractorId: quotation.subcontractorId,
              unitRate: it.unitRate,
              jobCode: createdJob.jobCode,
              jobTitle: createdJob.title,
              notes: `แปลงจากใบเสนอราคา ${quotation.quotationNo}`,
            },
          });
        }
      }

      // 5. Update Quotation Status
      await tx.subQuotation.update({
        where: { id: quotation.id },
        data: {
          status: 'CONVERTED',
          convertedJobId: createdJob.id,
        },
      });

      return {
        job: createdJob,
        contract: createdContract,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `แปลงใบเสนอราคาเป็นงานติดตั้ง ${result.job.jobCode} สำเร็จแล้ว`,
        job: result.job,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error converting quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to convert quotation' }, { status: 500 });
  }
}
