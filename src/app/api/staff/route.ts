import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    let staff = await prisma.staffMember.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Seed initial staff list if database is empty
    if (staff.length === 0) {
      const initialStaff = [
        { name: 'สมชาย ใจดี', role: 'FOREMAN', phone: '081-111-2222', lineUserId: '' },
        { name: 'วิชัย คุมงาน', role: 'FOREMAN', phone: '082-333-4444', lineUserId: '' },
        { name: 'กิตติศักดิ์ วิศวกร', role: 'PM', phone: '089-555-6666', lineUserId: '' },
        { name: 'ศิริพร งานขาย', role: 'SALES', phone: '086-777-8888', lineUserId: '' },
        { name: 'ธนากร งานขาย', role: 'SALES', phone: '087-999-0000', lineUserId: '' },
      ];

      for (const s of initialStaff) {
        await prisma.staffMember.create({ data: s });
      }

      staff = await prisma.staffMember.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error fetching staff members:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, phone, email, lineUserId } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อและตำแหน่งของทีมงาน' }, { status: 400 });
    }

    const created = await prisma.staffMember.create({
      data: {
        name: name.trim(),
        role: role.trim().toUpperCase(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        lineUserId: lineUserId?.trim() || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ error: error.message || 'Failed to create staff' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing staff id' }, { status: 400 });
    }

    await prisma.staffMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'ลบรายชื่อทีมงานเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete staff' }, { status: 500 });
  }
}
