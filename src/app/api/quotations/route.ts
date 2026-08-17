import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatQuotationCode } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const companyCode = searchParams.get('companyCode');
    const subcontractorId = searchParams.get('subcontractorId');
    const status = searchParams.get('status');

    const where: any = {};
    if (companyId && companyId !== 'all') where.companyId = companyId;
    if (companyCode && companyCode !== 'all') where.company = { code: companyCode };
    if (subcontractorId) where.subcontractorId = subcontractorId;
    if (status && status !== 'all') where.status = status;

    const quotations = await prisma.subQuotation.findMany({
      where,
      orderBy: { quotationDate: 'desc' },
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

    return NextResponse.json(quotations);
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId,
      subcontractorId,
      soNumber,
      contractorSeq,
      projectName,
      quotationDate,
      validUntil,
      whtRate,
      notes,
      items,
    } = body;

    if (!companyId || !subcontractorId || !projectName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน: บริษัท, ช่าง, ชื่อโครงการ และรายการงานอย่างน้อย 1 รายการ' },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: 'ไม่พบบริษัทที่ระบุ' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate sequential Quotation Number [COMP_CODE]-QT-[SO_NO]-[SEQ] (e.g. CP1-QT-SO260817-0001-01) or [COMP_CODE]-QT-YYMM-XXXX
      const date = quotationDate ? new Date(quotationDate) : new Date();
      const count = await tx.subQuotation.count({
        where: { companyId: company.id },
      });
      const quotationNo = formatQuotationCode(
        company.code,
        count + 1,
        date,
        soNumber,
        contractorSeq ? parseInt(contractorSeq) : 1
      );

      // 2. Process Items
      const itemsData = items.map((it: any) => {
        const qty = parseFloat(it.quantity) || 0;
        const rate = parseFloat(it.unitRate) || 0;
        return {
          itemId: it.itemId || null,
          itemCode: it.itemCode?.trim() || 'ITEM-GEN',
          itemName: it.itemName?.trim() || 'งานติดตั้ง',
          quantity: qty,
          unit: it.unit?.trim() || 'หน่วย',
          unitRate: rate,
          totalAmount: qty * rate,
          notes: it.notes?.trim() || null,
        };
      });

      const subtotal = itemsData.reduce((sum: number, it: any) => sum + it.totalAmount, 0);
      const taxPercent = whtRate !== undefined ? parseFloat(whtRate) : 3.0;
      const whtAmount = Math.round((subtotal * (taxPercent / 100)) * 100) / 100;
      const grandTotal = Math.round((subtotal - whtAmount) * 100) / 100;

      // 3. Create SubQuotation
      const quotation = await tx.subQuotation.create({
        data: {
          companyId: company.id,
          subcontractorId,
          quotationNo,
          quotationDate: date,
          validUntil: validUntil ? new Date(validUntil) : null,
          projectName: projectName.trim(),
          subtotal,
          whtRate: taxPercent,
          whtAmount,
          grandTotal,
          status: 'DRAFT',
          notes: notes?.trim() || null,
          items: {
            create: itemsData,
          },
        },
        include: {
          company: true,
          subcontractor: true,
          items: true,
        },
      });

      return quotation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to create quotation' }, { status: 500 });
  }
}
