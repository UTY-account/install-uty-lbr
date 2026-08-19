import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const defects = await prisma.defectTicket.findMany({
      where: { salesOrderId: id },
      include: {
        subcontractor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(defects);
  } catch (error: any) {
    console.error('Error fetching defects:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch defects' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      title,
      description,
      photos,
      severity,
      subcontractorId,
      actionType,
      deductAmount,
      extraCost,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'กรุณาระบุหัวข้อจุดที่ต้องแก้ไข' }, { status: 400 });
    }

    const defect = await prisma.defectTicket.create({
      data: {
        salesOrderId: id,
        title: title.trim(),
        description: description?.trim() || null,
        photos: typeof photos === 'string' ? photos : JSON.stringify(photos || []),
        severity: severity || 'NORMAL',
        subcontractorId: subcontractorId || null,
        actionType: actionType || 'FIX_BY_ORIGINAL',
        deductAmount: parseFloat(deductAmount) || 0,
        extraCost: parseFloat(extraCost) || 0,
        notes: notes?.trim() || null,
        status: 'OPEN',
      },
      include: {
        subcontractor: true,
      },
    });

    // Update SO status to DEFECT_FIXING
    await prisma.salesOrder.update({
      where: { id },
      data: { status: 'DEFECT_FIXING' },
    });

    return NextResponse.json(defect, { status: 201 });
  } catch (error: any) {
    console.error('Error creating defect ticket:', error);
    return NextResponse.json({ error: error.message || 'Failed to create defect ticket' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { defectId, status, deductAmount, extraCost, notes, actionType } = body;

    if (!defectId) {
      return NextResponse.json({ error: 'กรุณาระบุ defectId' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'FIXED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (deductAmount !== undefined) updateData.deductAmount = parseFloat(deductAmount) || 0;
    if (extraCost !== undefined) updateData.extraCost = parseFloat(extraCost) || 0;
    if (actionType !== undefined) updateData.actionType = actionType;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updated = await prisma.defectTicket.update({
      where: { id: defectId },
      data: updateData,
      include: {
        subcontractor: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating defect ticket:', error);
    return NextResponse.json({ error: error.message || 'Failed to update defect ticket' }, { status: 500 });
  }
}
