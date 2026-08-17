import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        rateHistory: {
          include: {
            subcontractor: {
              select: {
                id: true,
                name: true,
                phone: true,
                idCard: true,
                idCardStatus: true,
              },
            },
          },
          orderBy: { recordedAt: 'desc' },
        },
        _count: {
          select: {
            contractItems: true,
            quotationItems: true,
          },
        },
      },
    });

    // Calculate benchmark summary for each item
    const itemsWithStats = items.map(item => {
      const rates = item.rateHistory.map(r => r.unitRate);
      const minRate = rates.length > 0 ? Math.min(...rates) : item.standardRate;
      const maxRate = rates.length > 0 ? Math.max(...rates) : item.standardRate;
      const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : item.standardRate;

      // Find the subcontractor offering the lowest rate
      const lowestRateEntry = item.rateHistory.find(r => r.unitRate === minRate);

      return {
        ...item,
        stats: {
          minRate,
          maxRate,
          avgRate,
          ratesCount: rates.length,
          lowestSubcontractor: lowestRateEntry ? lowestRateEntry.subcontractor : null,
        },
      };
    });

    return NextResponse.json(itemsWithStats);
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, category, unit, standardRate, description } = body;

    if (!code || !name || !unit) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสรายการ, ชื่องาน, และหน่วยนับ' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.item.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: `รหัสรายการ ${cleanCode} มีอยู่ในระบบแล้ว` }, { status: 400 });
    }

    const item = await prisma.item.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        category: category?.trim() || null,
        unit: unit.trim(),
        standardRate: parseFloat(standardRate) || 0,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: error.message || 'Failed to create item' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, code, name, category, unit, standardRate, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (unit !== undefined) updateData.unit = unit.trim();
    if (standardRate !== undefined) updateData.standardRate = parseFloat(standardRate) || 0;
    if (description !== undefined) updateData.description = description?.trim() || null;

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: error.message || 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    // Check if item is used in contracts or quotations
    const contractCount = await prisma.subContractItem.count({ where: { itemId: id } });
    const quotationCount = await prisma.subQuotationItem.count({ where: { itemId: id } });

    if (contractCount > 0 || quotationCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบรหัสรายการที่ถูกนำไปใช้ในสัญญาหรือใบเสนอราคาแล้วได้' },
        { status: 400 }
      );
    }

    await prisma.itemRateHistory.deleteMany({ where: { itemId: id } });
    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'ลบรหัสรายการเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete item' }, { status: 500 });
  }
}
