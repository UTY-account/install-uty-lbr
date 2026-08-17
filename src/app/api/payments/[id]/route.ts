import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.subPayment.findUnique({
      where: { id: params.id },
      include: {
        subContract: {
          include: {
            subcontractor: true,
            job: {
              include: { company: true },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'ไม่พบรายการจ่ายเงิน' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { amount, paymentDate, whtRate, slipUrl, refNo, notes, editReason } = body;

    const oldPayment = await prisma.subPayment.findUnique({
      where: { id: params.id },
      include: {
        subContract: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!oldPayment) {
      return NextResponse.json({ error: 'ไม่พบรายการจ่ายเงินที่ต้องการแก้ไข' }, { status: 404 });
    }

    const contract = oldPayment.subContract;
    const newAmount = amount !== undefined ? parseFloat(amount) : oldPayment.amount;

    if (isNaN(newAmount) || newAmount <= 0) {
      return NextResponse.json({ error: 'กรุณาระบุยอดเงินที่ถูกต้องและมากกว่า 0 บาท' }, { status: 400 });
    }

    // Check overpayment against contract (excluding this payment's old amount)
    const netContractAmount = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
    const otherPaymentsTotal = contract.payments
      .filter((p) => p.id !== params.id && p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const maxAllowedForThisPayment = Math.max(0, netContractAmount - otherPaymentsTotal);

    if (newAmount > maxAllowedForThisPayment + 0.001) {
      return NextResponse.json(
        {
          error: `ยอดเงินที่แก้ไข (${newAmount.toLocaleString()} บาท) เกินยอดคงเหลือสูงสุดที่สามารถจ่ายได้ (${maxAllowedForThisPayment.toLocaleString()} บาท)`,
          maxAllowed: maxAllowedForThisPayment,
        },
        { status: 400 }
      );
    }

    const taxRate = whtRate !== undefined ? parseFloat(whtRate) : oldPayment.whtRate;
    const newWhtAmount = Math.round((newAmount * (taxRate / 100)) * 100) / 100;
    const newNetAmount = Math.round((newAmount - newWhtAmount) * 100) / 100;
    const newDate = paymentDate ? new Date(paymentDate) : oldPayment.paymentDate;

    // Parse existing edit history
    let existingHistory: any[] = [];
    if (oldPayment.editHistory) {
      try {
        existingHistory = JSON.parse(oldPayment.editHistory);
      } catch (e) {
        existingHistory = [];
      }
    }

    // Record audit trail
    const auditRecord = {
      editedAt: new Date().toISOString(),
      reason: editReason?.trim() || 'แก้ไขรายละเอียดการจ่ายเงิน',
      changes: {
        oldAmount: oldPayment.amount,
        newAmount: newAmount,
        oldWhtRate: oldPayment.whtRate,
        newWhtRate: taxRate,
        oldWhtAmount: oldPayment.whtAmount,
        newWhtAmount: newWhtAmount,
        oldNetAmount: oldPayment.netAmount,
        newNetAmount: newNetAmount,
        oldPaymentDate: oldPayment.paymentDate,
        newPaymentDate: newDate,
        oldRefNo: oldPayment.refNo || '',
        newRefNo: refNo !== undefined ? refNo?.trim() || '' : oldPayment.refNo || '',
        oldNotes: oldPayment.notes || '',
        newNotes: notes !== undefined ? notes?.trim() || '' : oldPayment.notes || '',
      },
    };

    existingHistory.unshift(auditRecord);

    const updated = await prisma.subPayment.update({
      where: { id: params.id },
      data: {
        amount: newAmount,
        whtRate: taxRate,
        whtAmount: newWhtAmount,
        netAmount: newNetAmount,
        paymentDate: newDate,
        refNo: refNo !== undefined ? refNo?.trim() || null : oldPayment.refNo,
        slipUrl: slipUrl !== undefined ? slipUrl?.trim() || null : oldPayment.slipUrl,
        notes: notes !== undefined ? notes?.trim() || null : oldPayment.notes,
        editHistory: JSON.stringify(existingHistory),
      },
    });

    return NextResponse.json({
      success: true,
      payment: updated,
      message: 'แก้ไขประวัติการจ่ายเงินเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subPayment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'ลบรายการจ่ายเงินเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete payment' }, { status: 500 });
  }
}
