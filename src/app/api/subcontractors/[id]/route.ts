import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id: params.id },
      include: {
        contracts: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
            items: true,
            payments: {
              orderBy: { installmentNo: 'asc' },
            },
          },
          orderBy: { contractDate: 'desc' },
        },
        rateHistory: {
          include: {
            item: true,
          },
          orderBy: { recordedAt: 'desc' },
        },
        quotations: {
          include: {
            company: true,
            items: true,
          },
          orderBy: { quotationDate: 'desc' },
        },
        schedules: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!subcontractor) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลช่าง' }, { status: 404 });
    }

    // Compute financial aggregates
    let totalContractValue = 0;
    let totalPaid = 0;
    let totalPending = 0;

    for (const contract of subcontractor.contracts) {
      const netContract = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
      totalContractValue += netContract;

      const paid = contract.payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);

      totalPaid += paid;
      totalPending += Math.max(0, netContract - paid);
    }

    return NextResponse.json({
      ...subcontractor,
      totalContractValue,
      totalPaid,
      totalPending,
    });
  } catch (error: any) {
    console.error('Error fetching subcontractor detail:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch subcontractor detail' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      name,
      idCard,
      phone,
      bankName,
      bankAccountNo,
      bankAccountName,
      idCardPhotoUrl,
      idCardStatus,
      skills,
      address,
      status,
      notes,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (idCard !== undefined) {
      const cleanId = idCard.replace(/\D/g, '').slice(0, 13);
      if (cleanId.length === 13) {
        updateData.idCard = cleanId;
      }
    }
    if (phone !== undefined) updateData.phone = phone.trim();
    if (bankName !== undefined) updateData.bankName = bankName?.trim() || null;
    if (bankAccountNo !== undefined) updateData.bankAccountNo = bankAccountNo?.trim() || null;
    if (bankAccountName !== undefined) updateData.bankAccountName = bankAccountName?.trim() || null;
    if (idCardPhotoUrl !== undefined) {
      updateData.idCardPhotoUrl = idCardPhotoUrl?.trim() || null;
      if (idCardPhotoUrl) {
        updateData.idCardStatus = 'VERIFIED';
      }
    }
    if (idCardStatus !== undefined) updateData.idCardStatus = idCardStatus;
    if (skills !== undefined) updateData.skills = skills?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updated = await prisma.subcontractor.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating subcontractor:', error);
    return NextResponse.json({ error: error.message || 'Failed to update subcontractor' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if contractor has active contracts
    const contractCount = await prisma.subContract.count({
      where: { subcontractorId: params.id },
    });

    if (contractCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบช่างที่มีสัญญาจ้างอยู่ในระบบได้ กรุณาเปลี่ยนสถานะเป็น INACTIVE แทน' },
        { status: 400 }
      );
    }

    // Delete related rate history and unlinked quotations
    await prisma.itemRateHistory.deleteMany({
      where: { subcontractorId: params.id },
    });

    const quotations = await prisma.subQuotation.findMany({
      where: { subcontractorId: params.id },
    });

    for (const q of quotations) {
      await prisma.subQuotationItem.deleteMany({ where: { subQuotationId: q.id } });
      await prisma.subQuotation.delete({ where: { id: q.id } });
    }

    await prisma.subcontractor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'ลบข้อมูลช่างเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting subcontractor:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete subcontractor' }, { status: 500 });
  }
}
