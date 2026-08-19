import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyCode = searchParams.get('companyCode');

    const where: any = { status: 'ACTIVE' };
    if (companyCode && companyCode !== 'all' && companyCode !== 'ALL') {
      where.OR = [
        { companyCode },
        { companyCode: 'ALL' },
      ];
    }

    let groups = await prisma.lineGroup.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // If empty, auto-seed typical preset groups
    if (groups.length === 0) {
      const presets = [
        {
          name: 'กลุ่มโฟร์แมน & หน้างาน (UTY)',
          groupId: 'C_FOREMAN_UTY_SAMPLE',
          companyCode: 'UTY',
          isDefault: true,
          description: 'สำหรับแจ้งเตือนคิวงานและโฟร์แมนเข้าหน้างาน',
        },
        {
          name: 'กลุ่มช่างติดตั้งไม้ (LBR)',
          groupId: 'C_CARPENTER_LBR_SAMPLE',
          companyCode: 'LBR',
          isDefault: true,
          description: 'สำหรับแจ้งงานช่างไม้และทีมติดตั้ง',
        },
        {
          name: 'กลุ่มผู้บริหาร & เซลประสานงาน',
          groupId: 'C_SALES_ALL_SAMPLE',
          companyCode: 'ALL',
          isDefault: false,
          description: 'สำหรับสรุปยอดขายและวันนัดหมายลูกค้า',
        },
      ];

      for (const p of presets) {
        await prisma.lineGroup.create({ data: p });
      }

      groups = await prisma.lineGroup.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json(groups);
  } catch (error: any) {
    console.error('Error fetching LINE groups:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch LINE groups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, groupId, companyCode, isDefault, description } = body;

    if (!name || !groupId) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อกลุ่ม และ LINE Group ID' }, { status: 400 });
    }

    const cleanGroupId = groupId.trim();
    const existing = await prisma.lineGroup.findUnique({
      where: { groupId: cleanGroupId },
    });

    if (existing) {
      // Re-activate if inactive
      const updated = await prisma.lineGroup.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          companyCode: companyCode || 'ALL',
          isDefault: isDefault ?? true,
          description: description?.trim() || null,
          status: 'ACTIVE',
        },
      });
      return NextResponse.json(updated);
    }

    const group = await prisma.lineGroup.create({
      data: {
        name: name.trim(),
        groupId: cleanGroupId,
        companyCode: companyCode || 'ALL',
        isDefault: isDefault ?? true,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error: any) {
    console.error('Error creating LINE group:', error);
    return NextResponse.json({ error: error.message || 'Failed to create LINE group' }, { status: 500 });
  }
}
