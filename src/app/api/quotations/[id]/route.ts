import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await prisma.subQuotation.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        subcontractor: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'ไม่พบใบเสนอราคา' }, { status: 404 });
    }

    return NextResponse.json(quotation);
  } catch (error: any) {
    console.error('Error fetching quotation detail:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quotation' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, notes, validUntil } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;

    const updated = await prisma.subQuotation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to update quotation' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subQuotation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'ลบใบเสนอราคาเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete quotation' }, { status: 500 });
  }
}
