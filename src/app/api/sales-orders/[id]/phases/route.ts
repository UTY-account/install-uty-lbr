import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const phases = await prisma.siteVisitPhase.findMany({
      where: { salesOrderId: id },
      orderBy: { phaseNumber: 'asc' },
    });
    return NextResponse.json(phases);
  } catch (error: any) {
    console.error('Error fetching phases:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch phases' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { title, startDate, endDate, notes, taggedStaff } = body;

    if (!startDate) {
      return NextResponse.json({ error: 'กรุณาระบุวันที่เริ่มเข้างานในรอบนี้' }, { status: 400 });
    }

    const count = await prisma.siteVisitPhase.count({
      where: { salesOrderId: id },
    });

    const phaseNumber = count + 1;
    const sDate = new Date(startDate);
    const eDate = endDate ? new Date(endDate) : sDate;

    const phase = await prisma.siteVisitPhase.create({
      data: {
        salesOrderId: id,
        phaseNumber,
        title: title?.trim() || `รอบที่ ${phaseNumber}: เข้าทำงานต่อเนื่อง`,
        startDate: sDate,
        endDate: eDate,
        status: 'PLANNED',
        notes: notes?.trim() || null,
        taggedStaff: typeof taggedStaff === 'string' ? taggedStaff : JSON.stringify(taggedStaff || []),
      },
    });

    // Update SO status back to CONFIRMED / IN_PROGRESS if it was ON_HOLD
    await prisma.salesOrder.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        onHoldReason: null,
      },
    });

    return NextResponse.json(phase, { status: 201 });
  } catch (error: any) {
    console.error('Error creating phase:', error);
    return NextResponse.json({ error: error.message || 'Failed to create phase' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { phaseId, status, onHoldReason, notes, startDate, endDate } = body;

    if (!phaseId) {
      return NextResponse.json({ error: 'กรุณาระบุ phaseId' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (onHoldReason !== undefined) updateData.onHoldReason = onHoldReason?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    const updated = await prisma.siteVisitPhase.update({
      where: { id: phaseId },
      data: updateData,
    });

    // If phase status changed to ON_HOLD, reflect in parent SO
    if (status === 'ON_HOLD') {
      await prisma.salesOrder.update({
        where: { id: params.id },
        data: {
          status: 'ON_HOLD',
          onHoldReason: onHoldReason || 'พักงานรอบนี้รอหน้างานพร้อม',
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating phase:', error);
    return NextResponse.json({ error: error.message || 'Failed to update phase' }, { status: 500 });
  }
}
