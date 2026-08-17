import * as XLSX from 'xlsx';

export interface ExcelImportRow {
  companyCode: string;
  jobTitle: string;
  customerName?: string;
  customerPhone?: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitRate: number;
  subcontractorIdCard: string;
  subcontractorName: string;
  subcontractorPhone?: string;
  bankName?: string;
  bankAccount?: string;
  notes?: string;
  rowNumber?: number;
}

export interface GroupedSubContractItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalAmount: number;
  notes?: string;
}

export interface GroupedSubContract {
  subcontractorIdCard: string;
  subcontractorName: string;
  subcontractorPhone?: string;
  bankName?: string;
  bankAccount?: string;
  items: GroupedSubContractItem[];
  totalAmount: number;
  isExistingContractor?: boolean;
}

export interface GroupedJob {
  companyCode: string;
  jobTitle: string;
  customerName?: string;
  customerPhone?: string;
  contracts: GroupedSubContract[];
  totalJobAmount: number;
  totalItemsCount: number;
}

// Generate Excel Template Buffer
export function generateExcelTemplate(): Buffer {
  const headers = [
    'รหัสบริษัท (Company Code)',
    'ชื่องาน / สถานที่ติดตั้ง (Job Title / Site)',
    'ชื่อลูกค้า (Customer Name)',
    'เบอร์โทรลูกค้า (Customer Phone)',
    'รหัสรายการ (Item Code)',
    'ชื่องานย่อย (Item Name)',
    'ปริมาณ (Quantity)',
    'หน่วยนับ (Unit)',
    'ราคาต่อหน่วย (Unit Rate)',
    'เลขบัตร ปชช. ช่าง (13 หลัก)',
    'ชื่อ-นามสกุล ช่าง (Subcontractor Name)',
    'เบอร์โทรช่าง (Phone)',
    'ธนาคาร (Bank)',
    'เลขบัญชีธนาคาร (Bank Account)',
    'หมายเหตุ (Notes)',
  ];

  const sampleRows = [
    // Job 1 - ช่าง 1 คน ทำ 3 รายการย่อย
    [
      'CP1',
      'คอนโด ไนท์บริดจ์ ไพร์ม สาทร ยูนิต 1204',
      'คุณธนกร สมบัติเจริญ',
      '081-222-3344',
      'ITEM-WOOD-001',
      'ติดตั้งไม้พื้น SPC หนา 4-5 mm (รวมฟิล์มโฟมรอง)',
      55,
      'ตร.ม.',
      80,
      '1100400123456',
      'นายสมชาย มีฝีมือ',
      '081-234-5678',
      'กสิกรไทย',
      '123-4-56789-0',
      'ห้องนั่งเล่นและห้องนอนใหญ่',
    ],
    [
      'CP1',
      'คอนโด ไนท์บริดจ์ ไพร์ม สาทร ยูนิต 1204',
      'คุณธนกร สมบัติเจริญ',
      '081-222-3344',
      'ITEM-SKIRT-001',
      'ติดตั้งบัวเชิงผนัง PVC / PS สูง 2-4 นิ้ว',
      38,
      'ม.',
      30,
      '1100400123456',
      'นายสมชาย มีฝีมือ',
      '081-234-5678',
      'กสิกรไทย',
      '123-4-56789-0',
      'บัวรอบห้อง สี Oak',
    ],
    [
      'CP1',
      'คอนโด ไนท์บริดจ์ ไพร์ม สาทร ยูนิต 1204',
      'คุณธนกร สมบัติเจริญ',
      '081-222-3344',
      'ITEM-TRIM-001',
      'ติดตั้งตัวจบต่างระดับ / ตัวจบขอบประตู / จมูกบันได',
      6,
      'เส้น',
      60,
      '1100400123456',
      'นายสมชาย มีฝีมือ',
      '081-234-5678',
      'กสิกรไทย',
      '123-4-56789-0',
      'ตัวจบขอบห้องน้ำและระเบียง',
    ],
    // Job 2 - ช่างใหม่ (ระบบจะสร้างช่างใหม่และขึ้นสถานะ "รอแนบรูปบัตร ปชช.")
    [
      'CP1',
      'บ้านเดี่ยว บางกอก บูเลอวาร์ด แจ้งวัฒนะ แปลง 45',
      'คุณกิตติศักดิ์ วิชัยดิษฐ์',
      '089-777-8899',
      'ITEM-WOOD-003',
      'ติดตั้งไม้เอนจิเนียร์ (Engineered Wood) กาวยาง',
      120,
      'ตร.ม.',
      160,
      '3100500987654',
      'นายวิชัย ช่างไม้ไทย',
      '089-876-5432',
      'ไทยพาณิชย์',
      '456-7-89012-3',
      'ชั้น 2 ทั้งหมด',
    ],
    [
      'CP1',
      'บ้านเดี่ยว บางกอก บูเลอวาร์ด แจ้งวัฒนะ แปลง 45',
      'คุณกิตติศักดิ์ วิชัยดิษฐ์',
      '089-777-8899',
      'ITEM-WALL-001',
      'ติดตั้งไม้ระแนงกรุผนัง WPC / ไม้สังเคราะห์',
      24,
      'ตร.ม.',
      220,
      '3100500987654',
      'นายวิชัย ช่างไม้ไทย',
      '089-876-5432',
      'ไทยพาณิชย์',
      '456-7-89012-3',
      'ผนังทีวีชั้น 1',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Set column widths
  ws['!cols'] = [
    { wch: 14 }, // Company Code
    { wch: 45 }, // Job Title
    { wch: 22 }, // Customer Name
    { wch: 16 }, // Customer Phone
    { wch: 18 }, // Item Code
    { wch: 45 }, // Item Name
    { wch: 12 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 15 }, // Unit Rate
    { wch: 22 }, // Subcontractor ID Card
    { wch: 26 }, // Subcontractor Name
    { wch: 16 }, // Phone
    { wch: 18 }, // Bank
    { wch: 20 }, // Account No
    { wch: 30 }, // Notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Import_Template');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// Parse Raw Excel Buffer into Structured Rows
export function parseExcelBuffer(buffer: Buffer): ExcelImportRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  
  const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rawRows.length <= 1) {
    throw new Error('ไฟล์ Excel ไม่มีข้อมูลรายการงาน');
  }

  const rows: ExcelImportRow[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!r || r.length === 0 || !r[0]) continue; // Skip empty rows

    const companyCode = String(r[0] || '').trim().toUpperCase();
    const jobTitle = String(r[1] || '').trim();
    const customerName = r[2] ? String(r[2]).trim() : undefined;
    const customerPhone = r[3] ? String(r[3]).trim() : undefined;
    const itemCode = String(r[4] || '').trim().toUpperCase();
    const itemName = String(r[5] || '').trim();
    const quantity = parseFloat(r[6]) || 0;
    const unit = String(r[7] || 'หน่วย').trim();
    const unitRate = parseFloat(r[8]) || 0;
    const subcontractorIdCard = String(r[9] || '').replace(/\D/g, '').trim();
    const subcontractorName = String(r[10] || '').trim();
    const subcontractorPhone = r[11] ? String(r[11]).trim() : undefined;
    const bankName = r[12] ? String(r[12]).trim() : undefined;
    const bankAccount = r[13] ? String(r[13]).trim() : undefined;
    const notes = r[14] ? String(r[14]).trim() : undefined;

    if (!companyCode) {
      throw new Error(`แถวที่ ${i + 1}: กรุณาระบุรหัสบริษัท (Company Code)`);
    }
    if (!jobTitle) {
      throw new Error(`แถวที่ ${i + 1}: กรุณาระบุชื่องาน / สถานที่ติดตั้ง`);
    }
    if (!itemCode || !itemName) {
      throw new Error(`แถวที่ ${i + 1}: กรุณาระบุรหัสรายการและชื่องาน`);
    }
    if (!subcontractorIdCard || subcontractorIdCard.length !== 13) {
      throw new Error(`แถวที่ ${i + 1}: เลขบัตรประชาชนช่างต้องมี 13 หลัก (พบ: "${r[9]}")`);
    }
    if (!subcontractorName) {
      throw new Error(`แถวที่ ${i + 1}: กรุณาระบุชื่อช่าง`);
    }

    rows.push({
      companyCode,
      jobTitle,
      customerName,
      customerPhone,
      itemCode,
      itemName,
      quantity,
      unit,
      unitRate,
      subcontractorIdCard,
      subcontractorName,
      subcontractorPhone,
      bankName,
      bankAccount,
      notes,
      rowNumber: i + 1,
    });
  }

  return rows;
}

// Smart Multi-Item Auto-Grouping Algorithm
export function groupExcelRows(rows: ExcelImportRow[]): GroupedJob[] {
  const jobsMap = new Map<string, GroupedJob>();

  for (const row of rows) {
    // Unique Key for Job: CompanyCode + JobTitle
    const jobKey = `${row.companyCode}___${row.jobTitle.toLowerCase()}`;

    if (!jobsMap.has(jobKey)) {
      jobsMap.set(jobKey, {
        companyCode: row.companyCode,
        jobTitle: row.jobTitle,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        contracts: [],
        totalJobAmount: 0,
        totalItemsCount: 0,
      });
    }

    const job = jobsMap.get(jobKey)!;
    job.totalItemsCount += 1;

    // Find or create SubContract within this Job
    let contract = job.contracts.find(
      (c) => c.subcontractorIdCard === row.subcontractorIdCard
    );

    if (!contract) {
      contract = {
        subcontractorIdCard: row.subcontractorIdCard,
        subcontractorName: row.subcontractorName,
        subcontractorPhone: row.subcontractorPhone,
        bankName: row.bankName,
        bankAccount: row.bankAccount,
        items: [],
        totalAmount: 0,
      };
      job.contracts.push(contract);
    }

    // Add item line
    const itemTotal = row.quantity * row.unitRate;
    contract.items.push({
      itemCode: row.itemCode,
      itemName: row.itemName,
      quantity: row.quantity,
      unit: row.unit,
      unitRate: row.unitRate,
      totalAmount: itemTotal,
      notes: row.notes,
    });

    contract.totalAmount += itemTotal;
    job.totalJobAmount += itemTotal;
  }

  return Array.from(jobsMap.values());
}
