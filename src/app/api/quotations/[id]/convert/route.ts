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

    const date = new Date();
    const jobCount = await prisma.job.count({
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
    const createdJob = await prisma.job.create({
      data: {
        companyId: quotation.companyId,
        salesOrderId: quotation.salesOrderId || null,
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
    const createdContract = await prisma.subContract.create({
      data: {
        jobId: createdJob.id,
        subcontractorId: quotation.subcontractorId,
        contractCode: scCode,
        contractDate: new Date(),
        totalContractAmount: quotation.subtotal,
        extraAmount: 0,
        deductAmount: 0,
        paymentTerms: quotation.paymentTerms || 'งวด 1: 40% (เข้าหน้างาน), งวด 2: 40% (เสร็จงาน), งวด 3: 20% (ลูกค้าตรวจรับ)',
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
        await prisma.itemRateHistory.create({
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
    await prisma.subQuotation.update({
      where: { id: quotation.id },
      data: {
        status: 'CONVERTED',
        convertedJobId: createdJob.id,
      },
    });

    // 6. If linked to SO, update SO status to IN_PROGRESS
    if (quotation.salesOrderId) {
      await prisma.salesOrder.update({
        where: { id: quotation.salesOrderId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `แปลงใบเสนอราคาเป็นงานติดตั้ง ${createdJob.jobCode} สำเร็จแล้ว`,
        job: createdJob,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error converting quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to convert quotation' }, { status: 500 });
  }
}
