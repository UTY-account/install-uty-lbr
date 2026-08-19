import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatSOCode, formatDate } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status && status !== 'ALL') where.status = status;
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { soNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { siteLocation: { contains: q } },
        { salesPerson: { contains: q } },
      ];
    }

    const salesOrders = await prisma.salesOrder.findMany({
      where,
      include: {
        company: true,
        items: true,
        phases: {
          orderBy: { phaseNumber: 'asc' },
        },
        quotations: {
          include: {
            subcontractor: true,
          },
        },
        jobs: {
          include: {
            subContracts: {
              include: {
                subcontractor: true,
                payments: true,
              },
            },
          },
        },
        defects: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(salesOrders);
  } catch (error: any) {
    console.error('Error fetching sales orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sales orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId,
      salesPerson,
      customerName,
      customerPhone,
      siteLocation,
      googleMapsUrl,
      targetInstallDate,
      targetFinishDate,
      notes,
      taggedStaff,
      items,
    } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'กรุณาเลือกบริษัทผู้ขาย (LBR หรือ UTY)' }, { status: 400 });
    }

    if (!customerName || !siteLocation) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อลูกค้าและสถานที่/โครงการติดตั้ง' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: 'ไม่พบบริษัทที่ระบุ' }, { status: 404 });
    }

    let finalSONumber = '';
    if (body.soNumber && body.soNumber.trim()) {
      finalSONumber = body.soNumber.trim();
      const existing = await prisma.salesOrder.findUnique({
        where: { soNumber: finalSONumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: `เลขที่ SO "${finalSONumber}" มีอยู่ในระบบแล้ว กรุณาตรวจสอบหรือใช้เลขอื่น` },
          { status: 400 }
        );
      }
    } else {
      const date = new Date();
      const count = await prisma.salesOrder.count();
      finalSONumber = formatSOCode(company.code, count + 1, date);
    }

    // Calculate items
    let totalAmount = 0;
    const itemsData = (items || []).map((it: any) => {
      const qty = parseFloat(it.quantity) || 0;
      const rate = parseFloat(it.unitRate) || 0;
      const amount = qty * rate;
      totalAmount += amount;
      return {
        itemId: it.itemId || null,
        itemCode: it.itemCode?.trim() || 'ITEM-GEN',
        itemName: it.itemName?.trim() || 'งานติดตั้ง',
        category: it.category?.trim() || null,
        quantity: qty,
        unit: it.unit?.trim() || 'ตร.ม.',
        unitRate: rate,
        totalAmount: amount,
        notes: it.notes?.trim() || null,
      };
    });

    const installDate = targetInstallDate ? new Date(targetInstallDate) : null;
    const finishDate = targetFinishDate ? new Date(targetFinishDate) : installDate;

    // Create Sales Order
    const salesOrder = await prisma.salesOrder.create({
      data: {
        soNumber: finalSONumber,
        companyId,
        salesPerson: salesPerson?.trim() || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone?.trim() || null,
        siteLocation: siteLocation.trim(),
        googleMapsUrl: googleMapsUrl?.trim() || null,
        targetInstallDate: installDate,
        targetFinishDate: finishDate,
        totalAmount,
        status: 'PENDING_CONTRACTOR',
        notes: notes?.trim() || null,
        taggedStaff: typeof taggedStaff === 'string' ? taggedStaff : JSON.stringify(taggedStaff || []),
        items: {
          create: itemsData,
        },
      },
    });

    // Create Initial Site Visit Phase 1 if targetInstallDate is set
    if (installDate) {
      await prisma.siteVisitPhase.create({
        data: {
          salesOrderId: salesOrder.id,
          phaseNumber: 1,
          title: 'รอบที่ 1: เข้าติดตั้งเริ่มต้น',
          startDate: installDate,
          endDate: finishDate || installDate,
          status: 'PLANNED',
          notes: 'สร้างอัตโนมัติจากการเปิด SO',
          taggedStaff: typeof taggedStaff === 'string' ? taggedStaff : JSON.stringify(taggedStaff || []),
        },
      });
    }

    // Return complete created SO
    const result = await prisma.salesOrder.findUnique({
      where: { id: salesOrder.id },
      include: {
        company: true,
        items: true,
        phases: true,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sales order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create sales order' }, { status: 500 });
  }
}
