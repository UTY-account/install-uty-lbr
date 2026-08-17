import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: {
            jobs: true,
            quotations: true,
          },
        },
      },
    });
    return NextResponse.json(companies);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, nameTh, nameEn, taxId, phone, email, address, logoUrl, bankInfo } = body;

    if (!code || !nameTh || !taxId || !address) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น: รหัสบริษัท, ชื่อบริษัท, เลขผู้เสียภาษี, และที่อยู่' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.company.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: `มีรหัสบริษัท ${cleanCode} อยู่ในระบบแล้ว` }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        code: cleanCode,
        nameTh: nameTh.trim(),
        nameEn: nameEn?.trim() || null,
        taxId: taxId.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address.trim(),
        logoUrl: logoUrl?.trim() || null,
        bankInfo: bankInfo?.trim() || null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: error.message || 'Failed to create company' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, code, nameTh, nameEn, taxId, phone, email, address, bankInfo } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing company id' }, { status: 400 });
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (nameTh !== undefined) updateData.nameTh = nameTh.trim();
    if (nameEn !== undefined) updateData.nameEn = nameEn?.trim() || null;
    if (taxId !== undefined) updateData.taxId = taxId.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (address !== undefined) updateData.address = address.trim();
    if (bankInfo !== undefined) updateData.bankInfo = bankInfo?.trim() || null;

    const company = await prisma.company.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(company);
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: error.message || 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing company id' }, { status: 400 });
    }

    // Check if company has jobs
    const jobsCount = await prisma.job.count({
      where: { companyId: id },
    });

    if (jobsCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบริษัทที่มีงานติดตั้งอยู่ในระบบได้' },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'ลบข้อมูลบริษัทเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete company' }, { status: 500 });
  }
}
