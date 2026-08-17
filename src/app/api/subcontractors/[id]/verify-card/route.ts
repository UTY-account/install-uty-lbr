import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { idCardPhotoUrl } = body;

    if (!idCardPhotoUrl) {
      return NextResponse.json({ error: 'กรุณาแนบรูปถ่ายหรือลิงก์รูปบัตรประชาชน' }, { status: 400 });
    }

    const updated = await prisma.subcontractor.update({
      where: { id: params.id },
      data: {
        idCardPhotoUrl: idCardPhotoUrl.trim(),
        idCardStatus: 'VERIFIED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'แนบรูปบัตรประชาชนและยืนยันตัวตนช่างสำเร็จ',
      subcontractor: updated,
    });
  } catch (error: any) {
    console.error('Error verifying ID card:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify ID card' }, { status: 500 });
  }
}
