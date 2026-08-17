import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await prisma.workSchedule.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: { company: true },
        },
        subcontractor: true,
        subContract: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'ไม่พบแผนงาน' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error('Error fetching schedule detail:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch schedule' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
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

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (taskCategory !== undefined) updateData.taskCategory = taskCategory?.trim() || null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'COMPLETED' && progressPercent === undefined) {
        updateData.progressPercent = 100;
      }
    }
    if (progressPercent !== undefined) {
      const pct = parseInt(String(progressPercent));
      updateData.progressPercent = pct;
      if (pct >= 100 && status === undefined) {
        updateData.status = 'COMPLETED';
      }
    }
    if (linkedInstallmentNo !== undefined) {
      updateData.linkedInstallmentNo = linkedInstallmentNo ? parseInt(String(linkedInstallmentNo)) : null;
    }
    if (targetAmount !== undefined) {
      updateData.targetAmount = targetAmount ? parseFloat(String(targetAmount)) : null;
    }
    if (delayReason !== undefined) updateData.delayReason = delayReason?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updated = await prisma.workSchedule.update({
      where: { id: params.id },
      data: updateData,
      include: {
        job: {
          include: { company: true },
        },
        subcontractor: true,
        subContract: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: error.message || 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.workSchedule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'ลบแผนงานเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete schedule' }, { status: 500 });
  }
}
