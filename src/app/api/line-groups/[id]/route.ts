import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.lineGroup.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบกลุ่มไลน์ที่ระบุ' }, { status: 404 });
    }

    const updated = await prisma.lineGroup.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        groupId: body.groupId !== undefined ? body.groupId.trim() : undefined,
        companyCode: body.companyCode !== undefined ? body.companyCode : undefined,
        isDefault: body.isDefault !== undefined ? body.isDefault : undefined,
        description: body.description !== undefined ? body.description?.trim() || null : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating LINE group:', error);
    return NextResponse.json({ error: error.message || 'Failed to update LINE group' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.lineGroup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'ลบกลุ่มไลน์เรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting LINE group:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete LINE group' }, { status: 500 });
  }
}
