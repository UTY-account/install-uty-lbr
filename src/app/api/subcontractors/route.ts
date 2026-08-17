import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const idCardStatus = searchParams.get('idCardStatus');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (idCardStatus) where.idCardStatus = idCardStatus;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { idCard: { contains: search } },
        { phone: { contains: search } },
        { skills: { contains: search } },
      ];
    }

    const subcontractors = await prisma.subcontractor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contracts: {
          include: {
            payments: true,
            job: {
              select: {
                jobCode: true,
                title: true,
                status: true,
                company: {
                  select: { code: true, nameTh: true }
                }
              }
            }
          }
        },
        rateHistory: {
          include: {
            item: true
          },
          orderBy: { recordedAt: 'desc' }
        },
        _count: {
          select: {
            contracts: true,
            quotations: true,
          }
        }
      }
    });

    // Compute financial aggregates for each subcontractor
    const result = subcontractors.map(sub => {
      let totalContractValue = 0;
      let totalPaid = 0;
      let totalPending = 0;

      for (const contract of sub.contracts) {
        const netContract = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
        totalContractValue += netContract;

        const paid = contract.payments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);

        totalPaid += paid;
        totalPending += Math.max(0, netContract - paid);
      }

      return {
        ...sub,
        totalContractValue,
        totalPaid,
        totalPending,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching subcontractors:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch subcontractors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      idCard,
      name,
      phone,
      bankName,
      bankAccountNo,
      bankAccountName,
      idCardPhotoUrl,
      idCardStatus,
      skills,
      address,
      notes,
    } = body;

    const cleanIdCard = idCard?.replace(/\D/g, '').trim();
    if (!cleanIdCard || cleanIdCard.length !== 13) {
      return NextResponse.json({ error: 'เลขบัตรประชาชนต้องมี 13 หลัก' }, { status: 400 });
    }
    if (!name || !phone) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อและเบอร์โทรศัพท์ช่าง' }, { status: 400 });
    }

    const existing = await prisma.subcontractor.findUnique({
      where: { idCard: cleanIdCard },
    });

    if (existing) {
      return NextResponse.json({ error: `มีข้อมูลช่างเลขบัตรประชาชน ${cleanIdCard} ในระบบแล้ว (${existing.name})` }, { status: 400 });
    }

    const sub = await prisma.subcontractor.create({
      data: {
        idCard: cleanIdCard,
        name: name.trim(),
        phone: phone.trim(),
        bankName: bankName?.trim() || null,
        bankAccountNo: bankAccountNo?.trim() || null,
        bankAccountName: bankAccountName?.trim() || null,
        idCardPhotoUrl: idCardPhotoUrl?.trim() || null,
        idCardStatus: idCardPhotoUrl ? 'VERIFIED' : (idCardStatus || 'PENDING_ATTACHMENT'),
        skills: skills?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(sub, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subcontractor:', error);
    return NextResponse.json({ error: error.message || 'Failed to create subcontractor' }, { status: 500 });
  }
}
