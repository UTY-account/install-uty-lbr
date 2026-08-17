const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Companies
  const cp1 = await prisma.company.upsert({
    where: { code: 'CP1' },
    update: {},
    create: {
      code: 'CP1',
      nameTh: 'บริษัท โฮมอินสตอลเลชั่น แอนด์ เซอร์วิส จำกัด',
      nameEn: 'Home Installation & Services Co., Ltd.',
      taxId: '0105556012345',
      phone: '02-789-4560',
      email: 'contact@homeinstall.co.th',
      address: '88/9 อาคารติดตั้งทาวเวอร์ ชั้น 12 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110 (สำนักงานใหญ่)',
      bankInfo: 'ธนาคารกสิกรไทย เลขที่บัญชี 098-1-23456-7 บจก. โฮมอินสตอลเลชั่น แอนด์ เซอร์วิส',
      logoUrl: '/logos/cp1-logo.png'
    }
  });

  const cp2 = await prisma.company.upsert({
    where: { code: 'CP2' },
    update: {},
    create: {
      code: 'CP2',
      nameTh: 'บริษัท สยามฟลอร์ แอนด์ เดคคอร์ จำกัด',
      nameEn: 'Siam Floor & Decor Co., Ltd.',
      taxId: '0105559098765',
      phone: '02-123-9988',
      email: 'billing@siamfloor.co.th',
      address: '124 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร 10400 (สำนักงานใหญ่)',
      bankInfo: 'ธนาคารไทยพาณิชย์ เลขที่บัญชี 112-2-33445-5 บจก. สยามฟลอร์ แอนด์ เดคคอร์',
      logoUrl: '/logos/cp2-logo.png'
    }
  });

  // 2. Item Master Catalog
  const items = [
    { code: 'ITEM-WOOD-001', name: 'ติดตั้งไม้พื้น SPC หนา 4-5 mm (รวมฟิล์มโฟมรอง)', category: 'งานพื้น', unit: 'ตร.ม.', standardRate: 85, description: 'งานปูพื้น SPC ระบบคลิกล็อค ปูทับกระเบื้องเดิมหรือขัดมัน' },
    { code: 'ITEM-WOOD-002', name: 'ติดตั้งไม้ลามิเนต 8-12 mm (รวมโฟม PE)', category: 'งานพื้น', unit: 'ตร.ม.', standardRate: 75, description: 'งานปูพื้นไม้ลามิเนตพร้อมพลาสติกกันชื้น' },
    { code: 'ITEM-WOOD-003', name: 'ติดตั้งไม้เอนจิเนียร์ (Engineered Wood) กาวยาง', category: 'งานพื้น', unit: 'ตร.ม.', standardRate: 160, description: 'ปูไม้จริงเอนจิเนียร์ยึดกาวเต็มพื้นที่' },
    { code: 'ITEM-SKIRT-001', name: 'ติดตั้งบัวเชิงผนัง PVC / PS สูง 2-4 นิ้ว', category: 'งานบัวและอุปกรณ์', unit: 'ม.', standardRate: 35, description: 'งานติดบัวเชิงผนังเข้ามุม 45 องศา พร้อมยาแนวด้านบน' },
    { code: 'ITEM-TRIM-001', name: 'ติดตั้งตัวจบต่างระดับ / ตัวจบขอบประตู / จมูกบันได', category: 'งานบัวและอุปกรณ์', unit: 'เส้น', standardRate: 60, description: 'ติดตั้งโปรไฟล์ตัวจบงาน T-Profile / End-Profile' },
    { code: 'ITEM-TILE-001', name: 'ปูกระเบื้องยาง SPC ลายก้างปลา (Herringbone)', category: 'งานพื้น', unit: 'ตร.ม.', standardRate: 140, description: 'งานติดตั้งแพทเทิร์นก้างปลาแบบละเอียด' },
    { code: 'ITEM-WALL-001', name: 'ติดตั้งไม้ระแนงกรุผนัง WPC / ไม้สังเคราะห์', category: 'งานผนัง', unit: 'ตร.ม.', standardRate: 220, description: 'งานกรุผนังตกแต่งภายในพร้อมโครงคร่าวอลูมิเนียม' },
    { code: 'ITEM-CEIL-001', name: 'ติดตั้งงานกรุฝ้าเพดานระแนงไม้', category: 'งานฝ้า', unit: 'ตร.ม.', standardRate: 280, description: 'งานติดตั้งระแนงฝ้าเพดาน ซ่อนรางไฟ' },
  ];

  const itemMap = {};
  for (const item of items) {
    const created = await prisma.item.upsert({
      where: { code: item.code },
      update: item,
      create: item
    });
    itemMap[item.code] = created;
  }

  // 3. Subcontractors (ช่าง)
  const subcontractors = [
    {
      idCard: '1100400123456',
      name: 'นายสมชาย มีฝีมือ (ทีมช่างสมชาย)',
      phone: '081-234-5678',
      bankName: 'ธนาคารกสิกรไทย',
      bankAccountNo: '123-4-56789-0',
      bankAccountName: 'นายสมชาย มีฝีมือ',
      idCardStatus: 'VERIFIED',
      idCardPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
      skills: 'งานปูไม้ SPC, ลามิเนต, บัวเชิงผนัง, ลายก้างปลา',
      address: '15/2 หมู่ 3 ต.บางกระสอ อ.เมือง จ.นนทบุรี 11000',
      status: 'ACTIVE',
      notes: 'ฝีมือดีมาก ส่งงานตรงเวลา มีทีมงาน 4 คน'
    },
    {
      idCard: '3100500987654',
      name: 'นายวิชัย ช่างไม้ไทย',
      phone: '089-876-5432',
      bankName: 'ธนาคารไทยพาณิชย์',
      bankAccountNo: '456-7-89012-3',
      bankAccountName: 'นายวิชัย ช่างไม้ไทย',
      idCardStatus: 'VERIFIED',
      idCardPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      skills: 'งานไม้เอนจิเนียร์, ไม้ระแนงกรุผนัง, งานบันได',
      address: '99/41 ถ.กาญจนาภิเษก แขวงประเวศ เขตประเวศ กรุงเทพฯ 10250',
      status: 'ACTIVE',
      notes: 'เน้นงานเกรดพรีเมียม ประสบการณ์ 15 ปี'
    },
    {
      idCard: '1509900332211',
      name: 'นายประเสริฐ งานปูเนี๊ยบ',
      phone: '086-555-4321',
      bankName: 'ธนาคารกรุงเทพ',
      bankAccountNo: '789-0-12345-6',
      bankAccountName: 'นายประเสริฐ งานปูเนี๊ยบ',
      idCardStatus: 'PENDING_ATTACHMENT', // Imported without verified card photo
      idCardPhotoUrl: null,
      skills: 'งานปูพื้น SPC, ลามิเนต',
      address: '42 ซอยสุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260',
      status: 'ACTIVE',
      notes: 'นำเข้าจากระบบ Excel - รอแนบรูปถ่ายบัตรประชาชน'
    },
    {
      idCard: '0103558012345',
      name: 'ห้างหุ้นส่วนจำกัด ธนพล เดคคอเรชั่น (ช่างธนพล)',
      phone: '084-111-2233',
      bankName: 'ธนาคารกรุงไทย',
      bankAccountNo: '321-6-54321-0',
      bankAccountName: 'หจก. ธนพล เดคคอเรชั่น',
      idCardStatus: 'VERIFIED',
      idCardPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      skills: 'งานกรุผนัง WPC, งานฝ้าเพดานระแนง, บัวเชิงผนัง',
      address: '77/15 ถ.พหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
      status: 'ACTIVE',
      notes: 'รับงานสเกลใหญ่ โครงการคอนโด 50+ ห้อง'
    },
    {
      idCard: '2200300445566',
      name: 'นายอนุชา อินทิเรียฟิตติ้ง',
      phone: '095-888-9900',
      bankName: 'ธนาคารทหารไทยธนชาต',
      bankAccountNo: '654-3-21098-7',
      bankAccountName: 'นายอนุชา อินทิเรียฟิตติ้ง',
      idCardStatus: 'PENDING_ATTACHMENT',
      idCardPhotoUrl: null,
      skills: 'ปูก้างปลา, ตัวจบงานบันได',
      address: '18 ถ.ศรีนครินทร์ ต.หนองปรือ อ.บางพลี จ.สมุทรปราการ 10540',
      status: 'ACTIVE',
      notes: 'ช่างใหม่ นำเข้าจาก Excel'
    }
  ];

  const subMap = {};
  for (const sub of subcontractors) {
    const created = await prisma.subcontractor.upsert({
      where: { idCard: sub.idCard },
      update: sub,
      create: sub
    });
    subMap[sub.idCard] = created;
  }

  // 4. Rate Histories for Price Benchmarking
  const rateHistories = [
    { itemId: itemMap['ITEM-WOOD-001'].id, subcontractorId: subMap['1100400123456'].id, unitRate: 80, jobCode: 'CP1-JOB-202607-0001', jobTitle: 'คอนโด Life Asoke Hype ห้อง 814', recordedAt: new Date('2026-07-10') },
    { itemId: itemMap['ITEM-WOOD-001'].id, subcontractorId: subMap['3100500987654'].id, unitRate: 95, jobCode: 'CP1-JOB-202607-0004', jobTitle: 'บ้านเดี่ยว เศรษฐสิริ พัฒนาการ', recordedAt: new Date('2026-07-15') },
    { itemId: itemMap['ITEM-WOOD-001'].id, subcontractorId: subMap['1509900332211'].id, unitRate: 75, jobCode: 'CP1-JOB-202607-0008', jobTitle: 'คอนโด Ideo Q สุขุมวิท', recordedAt: new Date('2026-07-22') },
    { itemId: itemMap['ITEM-WOOD-001'].id, subcontractorId: subMap['0103558012345'].id, unitRate: 85, jobCode: 'CP2-JOB-202607-0012', jobTitle: 'อาคารสำนักงาน สาทรทาวเวอร์', recordedAt: new Date('2026-07-28') },
    
    { itemId: itemMap['ITEM-SKIRT-001'].id, subcontractorId: subMap['1100400123456'].id, unitRate: 30, jobCode: 'CP1-JOB-202607-0001', jobTitle: 'คอนโด Life Asoke Hype ห้อง 814', recordedAt: new Date('2026-07-10') },
    { itemId: itemMap['ITEM-SKIRT-001'].id, subcontractorId: subMap['3100500987654'].id, unitRate: 40, jobCode: 'CP1-JOB-202607-0004', jobTitle: 'บ้านเดี่ยว เศรษฐสิริ พัฒนาการ', recordedAt: new Date('2026-07-15') },
    { itemId: itemMap['ITEM-SKIRT-001'].id, subcontractorId: subMap['1509900332211'].id, unitRate: 28, jobCode: 'CP1-JOB-202607-0008', jobTitle: 'คอนโด Ideo Q สุขุมวิท', recordedAt: new Date('2026-07-22') },

    { itemId: itemMap['ITEM-TILE-001'].id, subcontractorId: subMap['1100400123456'].id, unitRate: 135, jobCode: 'CP1-JOB-202606-0030', jobTitle: 'Whizdom Essence สุขุมวิท', recordedAt: new Date('2026-06-25') },
    { itemId: itemMap['ITEM-TILE-001'].id, subcontractorId: subMap['2200300445566'].id, unitRate: 130, jobCode: 'CP2-JOB-202606-0045', jobTitle: 'The Crest Park Residences', recordedAt: new Date('2026-06-29') },

    { itemId: itemMap['ITEM-WALL-001'].id, subcontractorId: subMap['0103558012345'].id, unitRate: 210, jobCode: 'CP2-JOB-202607-0012', jobTitle: 'อาคารสำนักงาน สาทรทาวเวอร์', recordedAt: new Date('2026-07-28') },
    { itemId: itemMap['ITEM-WALL-001'].id, subcontractorId: subMap['3100500987654'].id, unitRate: 230, jobCode: 'CP1-JOB-202607-0004', jobTitle: 'บ้านเดี่ยว เศรษฐสิริ พัฒนาการ', recordedAt: new Date('2026-07-15') },
  ];

  await prisma.itemRateHistory.deleteMany();
  for (const rh of rateHistories) {
    await prisma.itemRateHistory.create({ data: rh });
  }

  // 5. Jobs with Multi-Item SubContracts and Dynamic Payments
  // Clean existing jobs to re-seed cleanly
  await prisma.job.deleteMany();

  // Job 1: CP1 - KnightsBridge Prime Sathorn (Multi-item: SPC floor + Skirting + Trims)
  const job1 = await prisma.job.create({
    data: {
      companyId: cp1.id,
      jobCode: 'CP1-JOB-202608-0001',
      title: 'ติดตั้งพื้นและบัว คอนโด ไนท์บริดจ์ ไพร์ม สาทร ชั้น 24',
      customerName: 'คุณภานุเดช รัตนศิริ',
      customerPhone: '081-999-1122',
      siteLocation: 'ห้อง 2408 อาคาร ไนท์บริดจ์ ไพร์ม ถนนนราธิวาสราชนครินทร์ สาทร กรุงเทพฯ',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-25'),
      notes: 'งานติดตั้ง SPC 5mm ลาย Oak Light Grey รวม 65 ตร.ม. พร้อมบัวและจบขอบ',
      subContracts: {
        create: [
          {
            subcontractorId: subMap['1100400123456'].id, // ช่างสมชาย
            contractCode: 'CP1-SC-202608-0001',
            contractDate: new Date('2026-08-01'),
            totalContractAmount: 7650, // 65*80 + 45*30 + 18*60 = 5200 + 1350 + 1100 = 7650
            extraAmount: 500, // งานเพิ่ม ซ่อมปรับระดับพื้นเดิม
            deductAmount: 0,
            status: 'ACTIVE',
            notes: 'ช่างสมชายรับผิดชอบ 3 รายการย่อยในสัญญาเดียว',
            items: {
              create: [
                {
                  itemId: itemMap['ITEM-WOOD-001'].id,
                  itemCode: 'ITEM-WOOD-001',
                  itemName: 'ติดตั้งไม้พื้น SPC หนา 4-5 mm (รวมฟิล์มโฟมรอง)',
                  quantity: 65,
                  unit: 'ตร.ม.',
                  unitRate: 80,
                  totalAmount: 5200,
                  notes: 'ห้องนั่งเล่นและ 2 ห้องนอน'
                },
                {
                  itemId: itemMap['ITEM-SKIRT-001'].id,
                  itemCode: 'ITEM-SKIRT-001',
                  itemName: 'ติดตั้งบัวเชิงผนัง PVC / PS สูง 2-4 นิ้ว',
                  quantity: 45,
                  unit: 'ม.',
                  unitRate: 30,
                  totalAmount: 1350,
                  notes: 'บัว PS สีเดียวกับพื้น'
                },
                {
                  itemId: itemMap['ITEM-TRIM-001'].id,
                  itemCode: 'ITEM-TRIM-001',
                  itemName: 'ติดตั้งตัวจบต่างระดับ / ตัวจบขอบประตู / จมูกบันได',
                  quantity: 18,
                  unit: 'เส้น',
                  unitRate: 60,
                  totalAmount: 1100,
                  notes: 'ตัวจบห้องน้ำและระเบียง'
                }
              ]
            },
            payments: {
              create: [
                {
                  installmentNo: 1,
                  paymentDate: new Date('2026-08-05'),
                  amount: 3000,
                  whtRate: 3.0,
                  whtAmount: 90,
                  netAmount: 2910,
                  refNo: 'KBANK-TRF-981204',
                  notes: 'เบิกงวดที่ 1 เข้างานและปูพื้นเสร็จ 80%',
                  status: 'PAID'
                },
                {
                  installmentNo: 2,
                  paymentDate: new Date('2026-08-12'),
                  amount: 2500,
                  whtRate: 3.0,
                  whtAmount: 75,
                  netAmount: 2425,
                  refNo: 'KBANK-TRF-984431',
                  notes: 'เบิกงวดที่ 2 ติดตั้งบัวและตัวจบเรียบร้อย',
                  status: 'PAID'
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Job 2: CP1 - บ้านเดี่ยว แกรนด์ บางกอก บูเลอวาร์ด (ช่างวิชัย - Engineered Wood + ระแนงผนัง)
  const job2 = await prisma.job.create({
    data: {
      companyId: cp1.id,
      jobCode: 'CP1-JOB-202608-0002',
      title: 'งานติดตั้งพื้นไม้เอนจิเนียร์และกรุผนังตกแต่ง แกรนด์ บางกอก บูเลอวาร์ด',
      customerName: 'ดร. กฤษฎา ธีระพงษ์',
      customerPhone: '085-333-8899',
      siteLocation: 'บ้านเลขที่ 168/22 ซอยราชพฤกษ์ 15 แขวงบางระมาด เขตตลิ่งชัน กรุงเทพฯ',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-08-08'),
      endDate: new Date('2026-08-30'),
      notes: 'งานเกรดพรีเมียม ไม้ Engineered Oak ธรรมชาติ',
      subContracts: {
        create: [
          {
            subcontractorId: subMap['3100500987654'].id, // ช่างวิชัย
            contractCode: 'CP1-SC-202608-0002',
            contractDate: new Date('2026-08-08'),
            totalContractAmount: 37700, // 180*160 + 38*230 = 28800 + 8740 + 160 = 37700 (rounded)
            extraAmount: 0,
            deductAmount: 0,
            status: 'ACTIVE',
            notes: 'สัญญาจ้างช่างวิชัย 2 รายการใหญ่',
            items: {
              create: [
                {
                  itemId: itemMap['ITEM-WOOD-003'].id,
                  itemCode: 'ITEM-WOOD-003',
                  itemName: 'ติดตั้งไม้เอนจิเนียร์ (Engineered Wood) กาวยาง',
                  quantity: 180,
                  unit: 'ตร.ม.',
                  unitRate: 160,
                  totalAmount: 28800,
                  notes: 'ชั้น 2 ทั้งหมด 4 ห้องนอนและโถง'
                },
                {
                  itemId: itemMap['ITEM-WALL-001'].id,
                  itemCode: 'ITEM-WALL-001',
                  itemName: 'ติดตั้งไม้ระแนงกรุผนัง WPC / ไม้สังเคราะห์',
                  quantity: 38,
                  unit: 'ตร.ม.',
                  unitRate: 230,
                  totalAmount: 8740,
                  notes: 'ผนังโถงบันไดและผนังหัวเตียง Master Bed'
                },
                {
                  itemId: itemMap['ITEM-TRIM-001'].id,
                  itemCode: 'ITEM-TRIM-001',
                  itemName: 'ติดตั้งตัวจบต่างระดับ / ตัวจบขอบประตู / จมูกบันได',
                  quantity: 4,
                  unit: 'เส้น',
                  unitRate: 40,
                  totalAmount: 160,
                  notes: 'ตัวจบขอบห้องน้ำ'
                }
              ]
            },
            payments: {
              create: [
                {
                  installmentNo: 1,
                  paymentDate: new Date('2026-08-10'),
                  amount: 15000,
                  whtRate: 3.0,
                  whtAmount: 450,
                  netAmount: 14550,
                  refNo: 'SCB-TRF-00192',
                  notes: 'มัดจำงวดที่ 1 วันเริ่มงาน',
                  status: 'PAID'
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Job 3: CP2 - The Bangkok Thonglor (ช่างประเสริฐ - Multi-items)
  const job3 = await prisma.job.create({
    data: {
      companyId: cp2.id,
      jobCode: 'CP2-JOB-202608-0001',
      title: 'งานปูพื้น SPC โครงการ เดอะ แบงค็อค ทองหล่อ ห้อง Penthouse',
      customerName: 'คุณมลธิรา ทรงกลด',
      customerPhone: '082-444-9911',
      siteLocation: 'ห้อง PH-02 เดอะ แบงค็อค ซอยทองหล่อ 1 กรุงเทพฯ',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-08-12'),
      endDate: new Date('2026-08-28'),
      notes: 'งานรีโนเวทห้องชุด พื้น SPC 5.5mm',
      subContracts: {
        create: [
          {
            subcontractorId: subMap['1509900332211'].id, // ช่างประเสริฐ
            contractCode: 'CP2-SC-202608-0001',
            contractDate: new Date('2026-08-12'),
            totalContractAmount: 11180, // 120*75 + 60*28 + 10*60 = 9000 + 1680 + 500 = 11180
            extraAmount: 0,
            deductAmount: 0,
            status: 'ACTIVE',
            notes: 'ช่างประเสริฐ (สถานะ: รอแนบรูปบัตร ปชช.)',
            items: {
              create: [
                {
                  itemId: itemMap['ITEM-WOOD-001'].id,
                  itemCode: 'ITEM-WOOD-001',
                  itemName: 'ติดตั้งไม้พื้น SPC หนา 4-5 mm (รวมฟิล์มโฟมรอง)',
                  quantity: 120,
                  unit: 'ตร.ม.',
                  unitRate: 75,
                  totalAmount: 9000,
                  notes: 'พื้นที่ทั้งหมด'
                },
                {
                  itemId: itemMap['ITEM-SKIRT-001'].id,
                  itemCode: 'ITEM-SKIRT-001',
                  itemName: 'ติดตั้งบัวเชิงผนัง PVC / PS สูง 2-4 นิ้ว',
                  quantity: 60,
                  unit: 'ม.',
                  unitRate: 28,
                  totalAmount: 1680,
                  notes: 'บัวขาว 3 นิ้ว'
                },
                {
                  itemId: itemMap['ITEM-TRIM-001'].id,
                  itemCode: 'ITEM-TRIM-001',
                  itemName: 'ติดตั้งตัวจบต่างระดับ / ตัวจบขอบประตู / จมูกบันได',
                  quantity: 10,
                  unit: 'เส้น',
                  unitRate: 50,
                  totalAmount: 500,
                  notes: 'ตัวจบประตูและตู้เสื้อผ้า Built-in'
                }
              ]
            },
            payments: {
              create: [] // ยังไม่มีการจ่าย
            }
          }
        ]
      }
    }
  });

  // 6. Subcontractor Quotations (ใบเสนอราคาแทนช่าง)
  await prisma.subQuotation.deleteMany();

  const qt1 = await prisma.subQuotation.create({
    data: {
      companyId: cp1.id,
      subcontractorId: subMap['1100400123456'].id,
      quotationNo: 'CP1-SUBQT-202608-0001',
      quotationDate: new Date('2026-08-15'),
      validUntil: new Date('2026-09-15'),
      projectName: 'โครงการ ปูพื้น SPC และบัวผนัง โฮมออฟฟิศ ทาวน์อินทาวน์ ลาดพร้าว',
      subtotal: 18500,
      whtRate: 3.0,
      whtAmount: 555,
      grandTotal: 17945, // 18500 - 555
      status: 'DRAFT',
      notes: 'เสนอราคาโดย นายสมชาย มีฝีมือ สำหรับงานติดตั้งโครงการทาวน์อินทาวน์',
      items: {
        create: [
          {
            itemId: itemMap['ITEM-WOOD-001'].id,
            itemCode: 'ITEM-WOOD-001',
            itemName: 'ติดตั้งไม้พื้น SPC หนา 4-5 mm (รวมฟิล์มโฟมรอง)',
            quantity: 150,
            unit: 'ตร.ม.',
            unitRate: 80,
            totalAmount: 12000,
            notes: 'ชั้น 1 และ ชั้น 2'
          },
          {
            itemId: itemMap['ITEM-SKIRT-001'].id,
            itemCode: 'ITEM-SKIRT-001',
            itemName: 'ติดตั้งบัวเชิงผนัง PVC / PS สูง 2-4 นิ้ว',
            quantity: 120,
            unit: 'ม.',
            unitRate: 30,
            totalAmount: 3600,
            notes: 'บัวรอบห้องทั้งหมด'
          },
          {
            itemId: itemMap['ITEM-TILE-001'].id,
            itemCode: 'ITEM-TILE-001',
            itemName: 'ปูกระเบื้องยาง SPC ลายก้างปลา (Herringbone)',
            quantity: 20,
            unit: 'ตร.ม.',
            unitRate: 135,
            totalAmount: 2700,
            notes: 'บริเวณโถงต้อนรับชั้น 1'
          },
          {
            itemId: itemMap['ITEM-TRIM-001'].id,
            itemCode: 'ITEM-TRIM-001',
            itemName: 'ติดตั้งตัวจบต่างระดับ / ตัวจบขอบประตู / จมูกบันได',
            quantity: 4,
            unit: 'เส้น',
            unitRate: 50,
            totalAmount: 200,
            notes: 'จบประตูทางเข้า'
          }
        ]
      }
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
