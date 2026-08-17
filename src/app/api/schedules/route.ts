import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyCode = searchParams.get('companyCode');
    const companyId = searchParams.get('companyId');
    const subcontractorId = searchParams.get('subcontractorId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const month = searchParams.get('month'); // 1 - 12
    const year = searchParams.get('year');   // e.g. 2026

    const where: any = {};

    if (companyCode && companyCode !== 'all') {
      where.job = { company: { code: companyCode } };
    }
    if (companyId && companyId !== 'all') {
      where.job = { companyId };
    }
    if (subcontractorId) {
      where.subcontractorId = subcontractorId;
    }
    if (jobId) {
      where.jobId = jobId;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.OR = [
        {
          startDate: { lte: endOfMonth },
          endDate: { gte: startOfMonth },
        },
      ];
    }

    const schedules = await prisma.workSchedule.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        subcontractor: true,
        subContract: {
          include: {
            payments: true,
          },
        },
      },
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch schedules' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobId,
      subContractId,
      subcontractorId,
      title,
      description,
      taskCategory,
      startDate,
      endDate,
      status,
      progressPercent,
      linkedInstallmentNo,
      targetAmount,
      delayReason,
      notes,
    } = body;

    if (!jobId || !subcontractorId || !title || !startDate) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น: งานติดตั้ง, ช่างผู้รับเหมา, ชื่องาน/กิจกรรม และวันที่เริ่ม' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    const schedule = await prisma.workSchedule.create({
      data: {
        jobId,
        subContractId: subContractId || null,
        subcontractorId,
        title: title.trim(),
        description: description?.trim() || null,
        taskCategory: taskCategory?.trim() || 'งานติดตั้งหลัก',
        startDate: start,
        endDate: end,
        status: status || 'PLANNED',
        progressPercent: progressPercent !== undefined ? parseInt(String(progressPercent)) : 0,
        linkedInstallmentNo: linkedInstallmentNo ? parseInt(String(linkedInstallmentNo)) : null,
        targetAmount: targetAmount ? parseFloat(String(targetAmount)) : null,
        delayReason: delayReason?.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        job: {
          include: { company: true },
        },
        subcontractor: true,
        subContract: true,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: error.message || 'Failed to create schedule' }, { status: 500 });
  }
}
