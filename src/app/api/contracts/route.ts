import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCode } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobId,
      subcontractorId,
      items, // Array of { itemId, itemCode, itemName, quantity, unit, unitRate, notes }
      extraAmount,
      deductAmount,
      notes,
    } = body;

    if (!jobId || !subcontractorId || !items || items.length === 0) {
      return NextResponse.json({ error: 'กรุณาระบุงานติดตั้ง, ช่างผู้รับเหมา, และรายการงานอย่างน้อย 1 รายการ' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'ไม่พบงานติดตั้ง' }, { status: 404 });
    }

    const contractCount = await prisma.subContract.count({
      where: { jobId: job.id },
    });
    const scCode = formatCode('SC', job.company.code, contractCount + 1, new Date());

    const itemsData = items.map((item: any) => {
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

    const totalContractAmount = itemsData.reduce((sum: number, it: any) => sum + it.totalAmount, 0);

    const contract = await prisma.subContract.create({
      data: {
        jobId: job.id,
        subcontractorId,
        contractCode: scCode,
        contractDate: new Date(),
        totalContractAmount,
        extraAmount: parseFloat(extraAmount) || 0,
        deductAmount: parseFloat(deductAmount) || 0,
        notes: notes?.trim() || null,
        status: 'ACTIVE',
        items: {
          create: itemsData,
        },
      },
      include: {
        subcontractor: true,
        items: true,
      },
    });

    // Record unit rate history for price benchmarking
    for (const it of itemsData) {
      if (it.itemId && it.unitRate > 0) {
        await prisma.itemRateHistory.create({
          data: {
            itemId: it.itemId,
            subcontractorId,
            unitRate: it.unitRate,
            jobCode: job.jobCode,
            jobTitle: job.title,
            notes: `สัญญา ${scCode} (${it.quantity} ${it.unit})`,
          },
        });
      }
    }

    return NextResponse.json(contract, { status: 201 });
  } catch (error: any) {
    console.error('Error adding contract:', error);
    return NextResponse.json({ error: error.message || 'Failed to add contract' }, { status: 500 });
  }
}
