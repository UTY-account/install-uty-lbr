import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { amount, paymentDate, whtRate, slipUrl, refNo, notes } = body;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: 'กรุณาระบุยอดเงินที่ถูกต้องและมากกว่า 0 บาท' }, { status: 400 });
    }

    const contract = await prisma.subContract.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
        subcontractor: true,
        job: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'ไม่พบสัญญาจ้างช่าง' }, { status: 404 });
    }

    // 1. Calculate Real-time Adjusted Contract Balance
    const netContractAmount = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
    const currentPaidTotal = contract.payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const remainingBalance = Math.max(0, netContractAmount - currentPaidTotal);

    // 2. Overpayment Prevention Check
    // Allow slight float tolerance (e.g. 0.01)
    if (paymentAmount > remainingBalance + 0.001) {
      return NextResponse.json(
        {
          error: `ยอดเงินที่ระบุ (${paymentAmount.toLocaleString()} บาท) เกินยอดคงเหลือที่จ่ายได้จริง (${remainingBalance.toLocaleString()} บาท)`,
          remainingBalance,
          netContractAmount,
          currentPaidTotal,
        },
        { status: 400 }
      );
    }

    // 3. Auto-increment Installment Number (1, 2, 3...)
    const nextInstallmentNo = contract.payments.length + 1;

    // 4. Calculate 3% WHT and Net Transfer Amount
    const taxRate = whtRate !== undefined ? parseFloat(whtRate) : 3.0;
    const whtAmount = Math.round((paymentAmount * (taxRate / 100)) * 100) / 100;
    const netAmount = Math.round((paymentAmount - whtAmount) * 100) / 100;

    // 5. Create SubPayment
    const payment = await prisma.subPayment.create({
      data: {
        subContractId: contract.id,
        installmentNo: nextInstallmentNo,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        amount: paymentAmount,
        whtRate: taxRate,
        whtAmount,
        netAmount,
        slipUrl: slipUrl || null,
        refNo: refNo?.trim() || null,
        notes: notes?.trim() || null,
        status: 'PAID',
      },
    });

    return NextResponse.json(
      {
        success: true,
        payment,
        summary: {
          installmentNo: nextInstallmentNo,
          amount: paymentAmount,
          whtAmount,
          netAmount,
          newPaidTotal: currentPaidTotal + paymentAmount,
          newRemainingBalance: Math.max(0, remainingBalance - paymentAmount),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: error.message || 'บันทึกการจ่ายเงินไม่สำเร็จ' }, { status: 500 });
  }
}
