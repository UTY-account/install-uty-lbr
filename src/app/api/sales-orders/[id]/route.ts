import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        company: true,
        items: {
          include: {
            item: true,
          },
        },
        phases: {
          orderBy: { phaseNumber: 'asc' },
        },
        quotations: {
          include: {
            subcontractor: true,
            items: true,
          },
        },
        jobs: {
          include: {
            subContracts: {
              include: {
                subcontractor: true,
                items: true,
                payments: {
                  orderBy: { installmentNo: 'asc' },
                },
              },
            },
            schedules: {
              include: {
                subcontractor: true,
              },
            },
          },
        },
        defects: {
          include: {
            subcontractor: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!salesOrder) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งขาย (Sales Order)' }, { status: 404 });
    }

    return NextResponse.json(salesOrder);
  } catch (error: any) {
    console.error('Error fetching sales order detail:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sales order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งขาย' }, { status: 404 });
    }

    const updateData: any = {};

    // 1. General Fields
    if (body.customerName !== undefined) updateData.customerName = body.customerName.trim();
    if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone?.trim() || null;
    if (body.siteLocation !== undefined) updateData.siteLocation = body.siteLocation.trim();
    if (body.googleMapsUrl !== undefined) updateData.googleMapsUrl = body.googleMapsUrl?.trim() || null;
    if (body.salesPerson !== undefined) updateData.salesPerson = body.salesPerson?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.taggedStaff !== undefined) {
      updateData.taggedStaff = typeof body.taggedStaff === 'string' ? body.taggedStaff : JSON.stringify(body.taggedStaff || []);
    }

    // 2. Status & On-Hold Handling
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'ON_HOLD') {
        updateData.onHoldReason = body.onHoldReason?.trim() || 'หน้างานไม่พร้อมเข้าทำงาน';
      }
    }

    // 3. Cancellation Handling
    if (body.status === 'CANCELLED') {
      updateData.cancelReason = body.cancelReason?.trim() || 'ลูกค้ายกเลิกงาน';
      if (body.cancelSettlement) {
        updateData.cancelSettlement = typeof body.cancelSettlement === 'string' 
          ? body.cancelSettlement 
          : JSON.stringify(body.cancelSettlement);
      }
    }

    // 4. Rescheduling with Audit Log
    if (body.targetInstallDate !== undefined) {
      const newStart = body.targetInstallDate ? new Date(body.targetInstallDate) : null;
      const oldStartStr = existing.targetInstallDate ? formatDate(existing.targetInstallDate) : 'ยังไม่ระบุ';
      const newStartStr = newStart ? formatDate(newStart) : 'ยังไม่ระบุ';

      if (oldStartStr !== newStartStr && newStart) {
        updateData.targetInstallDate = newStart;
        updateData.targetFinishDate = body.targetFinishDate ? new Date(body.targetFinishDate) : newStart;
        updateData.rescheduleReason = body.rescheduleReason?.trim() || 'ปรับเปลี่ยนตามคิวงาน';

        // Append to rescheduleHistory JSON array
        let history = [];
        try {
          if (existing.rescheduleHistory) history = JSON.parse(existing.rescheduleHistory);
        } catch (_) {}

        history.push({
          rescheduledAt: new Date().toISOString(),
          from: oldStartStr,
          to: newStartStr,
          reason: body.rescheduleReason?.trim() || 'ปรับเปลี่ยนตามคิวงาน',
          rescheduledBy: body.rescheduledBy || 'ผู้ใช้งานระบบ',
        });

        updateData.rescheduleHistory = JSON.stringify(history);
      }
    }

    // 5. Update Items if provided
    if (Array.isArray(body.items)) {
      await prisma.salesOrderItem.deleteMany({
        where: { salesOrderId: id },
      });

      let totalAmount = 0;
      const itemsData = body.items.map((it: any) => {
        const qty = parseFloat(it.quantity) || 0;
        const rate = parseFloat(it.unitRate) || 0;
        const amount = qty * rate;
        totalAmount += amount;
        return {
          salesOrderId: id,
          itemId: it.itemId || null,
          itemCode: it.itemCode?.trim() || 'ITEM-GEN',
          itemName: it.itemName?.trim() || 'งานติดตั้ง',
          category: it.category?.trim() || 'งานทั่วไป',
          quantity: qty,
          unit: it.unit?.trim() || 'หน่วย',
          unitRate: rate,
          totalAmount: amount,
          notes: it.notes?.trim() || null,
        };
      });

      for (const it of itemsData) {
        await prisma.salesOrderItem.create({ data: it });
      }

      updateData.totalAmount = totalAmount;
    }

    const updated = await prisma.salesOrder.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        items: true,
        phases: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating sales order:', error);
    return NextResponse.json({ error: error.message || 'Failed to update sales order' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.salesOrder.findUnique({
      where: { id },
      include: { jobs: true, quotations: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งขาย' }, { status: 404 });
    }

    if (existing.jobs.length > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบ SO ที่แปลงเป็นงานติดตั้งแล้วได้ (กรุณาใช้การเปลี่ยนสถานะเป็น CANCELLED แทน)' },
        { status: 400 }
      );
    }

    await prisma.salesOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'ลบคำสั่งขายเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting sales order:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete sales order' }, { status: 500 });
  }
}
