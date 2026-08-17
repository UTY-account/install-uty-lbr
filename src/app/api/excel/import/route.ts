import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseExcelBuffer, groupExcelRows } from '@/lib/excel-helper';
import { formatCode } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isPreview = formData.get('preview') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'กรุณาอัปโหลดไฟล์ Excel (.xlsx หรือ .xls)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Parse rows and validate structure
    const parsedRows = parseExcelBuffer(buffer);
    if (parsedRows.length === 0) {
      return NextResponse.json({ error: 'ไม่พบแถวข้อมูลในไฟล์ Excel' }, { status: 400 });
    }

    // 2. Auto-Group Rows (Job -> Subcontractor -> Multi-Items)
    const groupedJobs = groupExcelRows(parsedRows);

    // 3. Fetch existing data for verification (Companies, Subcontractors, Items)
    const companyCodes = Array.from(new Set(groupedJobs.map((g) => g.companyCode)));
    const companiesInDb = await prisma.company.findMany({
      where: { code: { in: companyCodes } },
    });
    const companyMap = new Map(companiesInDb.map((c) => [c.code, c]));

    // Check for missing companies
    for (const code of companyCodes) {
      if (!companyMap.has(code)) {
        return NextResponse.json(
          {
            error: `ไม่พบรหัสบริษัท "${code}" ในระบบ กรุณาตรวจสอบหรือเพิ่มข้อมูลบริษัทก่อนนำเข้า`,
          },
          { status: 400 }
        );
      }
    }

    // Check subcontractors status in DB
    const allIdCards = Array.from(
      new Set(parsedRows.map((r) => r.subcontractorIdCard))
    );
    const existingSubcontractors = await prisma.subcontractor.findMany({
      where: { idCard: { in: allIdCards } },
    });
    const subMap = new Map(existingSubcontractors.map((s) => [s.idCard, s]));

    // Check Items in DB
    const allItemCodes = Array.from(new Set(parsedRows.map((r) => r.itemCode)));
    const existingItems = await prisma.item.findMany({
      where: { code: { in: allItemCodes } },
    });
    const itemMap = new Map(existingItems.map((it) => [it.code, it]));

    // 4. If Preview mode, return enriched grouping structure for user review
    if (isPreview) {
      const previewJobs = groupedJobs.map((job) => {
        const company = companyMap.get(job.companyCode)!;
        return {
          ...job,
          companyName: company.nameTh,
          contracts: job.contracts.map((contract) => {
            const existingSub = subMap.get(contract.subcontractorIdCard);
            return {
              ...contract,
              isExistingContractor: !!existingSub,
              existingContractorName: existingSub?.name,
              idCardStatus: existingSub ? existingSub.idCardStatus : 'PENDING_ATTACHMENT',
              items: contract.items.map((it) => {
                const existingItem = itemMap.get(it.itemCode);
                return {
                  ...it,
                  isExistingItem: !!existingItem,
                };
              }),
            };
          }),
        };
      });

      const totalRowsCount = parsedRows.length;
      const totalJobsCount = groupedJobs.length;
      const totalContractsCount = groupedJobs.reduce((sum, j) => sum + j.contracts.length, 0);
      const totalNewContractorsCount = allIdCards.filter((id) => !subMap.has(id)).length;
      const totalContractValue = groupedJobs.reduce((sum, j) => sum + j.totalJobAmount, 0);

      return NextResponse.json({
        success: true,
        preview: true,
        summary: {
          totalRowsCount,
          totalJobsCount,
          totalContractsCount,
          totalSubcontractorsCount: allIdCards.length,
          totalNewContractorsCount,
          totalContractValue,
        },
        jobs: previewJobs,
      });
    }

    // 5. Execute Full Database Transaction (Atomic Commit)
    const importResult = await prisma.$transaction(async (tx) => {
      const createdJobsList = [];
      let newContractorsCreatedCount = 0;
      let newItemsCreatedCount = 0;
      const date = new Date();

      // Step A: Find-or-Create Subcontractors
      const activeSubMap = new Map<string, any>(subMap);

      for (const row of parsedRows) {
        if (!activeSubMap.has(row.subcontractorIdCard)) {
          const newSub = await tx.subcontractor.create({
            data: {
              idCard: row.subcontractorIdCard,
              name: row.subcontractorName,
              phone: row.subcontractorPhone || '080-000-0000',
              bankName: row.bankName || null,
              bankAccountNo: row.bankAccount || null,
              bankAccountName: row.subcontractorName,
              idCardStatus: 'PENDING_ATTACHMENT', // New imported subcontractor requires ID attachment
              skills: 'นำเข้าจากระบบ Excel',
              status: 'ACTIVE',
              notes: `สร้างอัตโนมัติจากการนำเข้า Excel วันที่ ${date.toLocaleDateString('th-TH')}`,
            },
          });
          activeSubMap.set(row.subcontractorIdCard, newSub);
          newContractorsCreatedCount++;
        }
      }

      // Step B: Auto-create Items if not existing
      const activeItemMap = new Map<string, any>(itemMap);
      for (const row of parsedRows) {
        if (!activeItemMap.has(row.itemCode)) {
          const newItem = await tx.item.create({
            data: {
              code: row.itemCode,
              name: row.itemName,
              unit: row.unit,
              standardRate: row.unitRate,
              category: 'งานทั่วไป',
              description: 'สร้างอัตโนมัติจากการนำเข้า Excel',
            },
          });
          activeItemMap.set(row.itemCode, newItem);
          newItemsCreatedCount++;
        }
      }

      // Step C: Create Jobs, SubContracts, SubContractItems, and log ItemRateHistory
      for (const gJob of groupedJobs) {
        const company = companyMap.get(gJob.companyCode)!;

        // Sequence number for Job Code
        const jobCount = await tx.job.count({
          where: { companyId: company.id },
        });
        const jobCode = formatCode('JOB', company.code, jobCount + 1, date);

        const createdJob = await tx.job.create({
          data: {
            companyId: company.id,
            jobCode,
            title: gJob.jobTitle,
            customerName: gJob.customerName || null,
            customerPhone: gJob.customerPhone || null,
            status: 'IN_PROGRESS',
            notes: `นำเข้าจาก Excel (${gJob.contracts.length} ช่าง, ${gJob.totalItemsCount} รายการ)`,
          },
        });

        let scIndex = 1;
        for (const gContract of gJob.contracts) {
          const sub = activeSubMap.get(gContract.subcontractorIdCard)!;
          const scCode = formatCode('SC', company.code, jobCount * 10 + scIndex, date);
          scIndex++;

          const itemsData = gContract.items.map((it) => {
            const dbItem = activeItemMap.get(it.itemCode);
            return {
              itemId: dbItem ? dbItem.id : null,
              itemCode: it.itemCode,
              itemName: it.itemName,
              quantity: it.quantity,
              unit: it.unit,
              unitRate: it.unitRate,
              totalAmount: it.totalAmount,
              notes: it.notes || null,
            };
          });

          const createdContract = await tx.subContract.create({
            data: {
              jobId: createdJob.id,
              subcontractorId: sub.id,
              contractCode: scCode,
              contractDate: date,
              totalContractAmount: gContract.totalAmount,
              extraAmount: 0,
              deductAmount: 0,
              status: 'ACTIVE',
              notes: `สร้างอัตโนมัติจาก Excel (${itemsData.length} รายการ)`,
              items: {
                create: itemsData,
              },
            },
          });

          // Record each item rate into ItemRateHistory
          for (const it of itemsData) {
            if (it.itemId && it.unitRate > 0) {
              await tx.itemRateHistory.create({
                data: {
                  itemId: it.itemId,
                  subcontractorId: sub.id,
                  unitRate: it.unitRate,
                  jobCode: createdJob.jobCode,
                  jobTitle: createdJob.title,
                  notes: `นำเข้า Excel สัญญา ${scCode} (${it.quantity} ${it.unit})`,
                },
              });
            }
          }
        }

        createdJobsList.push(createdJob);
      }

      return {
        createdJobsCount: createdJobsList.length,
        newContractorsCreatedCount,
        newItemsCreatedCount,
        totalImportedRows: parsedRows.length,
        createdJobsList,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `นำเข้าข้อมูลสำเร็จ: สร้างงานติดตั้ง ${importResult.createdJobsCount} งาน, สัญญาช่างรวม ${parsedRows.length} รายการ`,
        result: importResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error importing Excel:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel' },
      { status: 500 }
    );
  }
}
