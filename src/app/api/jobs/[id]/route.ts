import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        schedules: {
          include: {
            subcontractor: true,
            subContract: true,
          },
          orderBy: { startDate: 'asc' },
        },
        subContracts: {
          include: {
            subcontractor: true,
            items: {
              include: {
                item: true,
              },
            },
            payments: {
              orderBy: { installmentNo: 'asc' },
            },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลงานติดตั้ง' }, { status: 404 });
    }

    // Compute financial aggregates for contracts & job
    let totalJobContractAmount = 0;
    let totalJobPaidAmount = 0;
    let totalJobExtraAmount = 0;
    let totalJobDeductAmount = 0;

    const contracts = job.subContracts.map((contract) => {
      const netContract = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
      const totalPaid = contract.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = Math.max(0, netContract - totalPaid);
      const paymentProgress = netContract > 0 ? Math.min(100, Math.round((totalPaid / netContract) * 100)) : 0;

      totalJobContractAmount += contract.totalContractAmount;
      totalJobExtraAmount += contract.extraAmount;
      totalJobDeductAmount += contract.deductAmount;
      totalJobPaidAmount += totalPaid;

      return {
        ...contract,
        netContractAmount: netContract,
        totalPaid,
        remainingBalance,
        paymentProgress,
      };
    });

    const netJobAmount = totalJobContractAmount + totalJobExtraAmount - totalJobDeductAmount;
    const jobRemainingBalance = Math.max(0, netJobAmount - totalJobPaidAmount);
    const jobProgress = netJobAmount > 0 ? Math.min(100, Math.round((totalJobPaidAmount / netJobAmount) * 100)) : 0;

    return NextResponse.json({
      ...job,
      subContracts: contracts,
      financials: {
        totalContractAmount: totalJobContractAmount,
        extraAmount: totalJobExtraAmount,
        deductAmount: totalJobDeductAmount,
        netJobAmount,
        totalPaidAmount: totalJobPaidAmount,
        remainingBalance: jobRemainingBalance,
        progress: jobProgress,
      },
    });
  } catch (error: any) {
    console.error('Error fetching job details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch job details' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, customerName, customerPhone, siteLocation, status, startDate, endDate, notes } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (customerName !== undefined) updateData.customerName = customerName?.trim() || null;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone?.trim() || null;
    if (siteLocation !== undefined) updateData.siteLocation = siteLocation?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: error.message || 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'ลบงานติดตั้งเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete job' }, { status: 500 });
  }
}
