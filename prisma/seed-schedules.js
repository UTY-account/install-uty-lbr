const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo Work Schedules...');

  const jobs = await prisma.job.findMany({
    include: {
      subContracts: {
        include: {
          subcontractor: true,
        },
      },
    },
  });

  if (jobs.length === 0) {
    console.log('No jobs found to seed schedules.');
    return;
  }

  // Clear existing schedules
  await prisma.workSchedule.deleteMany({});

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  for (const job of jobs) {
    for (const contract of job.subContracts) {
      const sub = contract.subcontractor;

      // 1. Completed Milestone Task (linked to Installment 1)
      await prisma.workSchedule.create({
        data: {
          jobId: job.id,
          subContractId: contract.id,
          subcontractorId: sub.id,
          title: `เข้าเคลียร์หน้างานและเตรียมอุปกรณ์ (${sub.name})`,
          description: 'ตรวจสอบระดับพื้น ผนัง และขนถ่ายวัสดุเข้าอาคาร',
          taskCategory: 'เตรียมหน้างาน',
          startDate: new Date(year, month, 5),
          endDate: new Date(year, month, 7),
          status: 'COMPLETED',
          progressPercent: 100,
          linkedInstallmentNo: 1,
          targetAmount: 4500,
          notes: 'ตรวจรับงานเบื้องต้นเรียบร้อย ช่างมาตรงเวลา',
        },
      });

      // 2. In Progress Main Installation Task
      await prisma.workSchedule.create({
        data: {
          jobId: job.id,
          subContractId: contract.id,
          subcontractorId: sub.id,
          title: `ดำเนินการติดตั้งหลักตามสัญญา (${sub.name})`,
          description: 'งานปูพื้น SPC / งานติดตั้งโครงฝ้า และเก็บรอยต่อ',
          taskCategory: 'งานติดตั้งหลัก',
          startDate: new Date(year, month, 12),
          endDate: new Date(year, month, 18),
          status: 'IN_PROGRESS',
          progressPercent: 65,
          linkedInstallmentNo: 2,
          targetAmount: 5000,
          notes: 'งานคืบหน้าตามแผน มีฝุ่นเล็กน้อย นิติแจ้งให้เก็บกวาดทุกวัน',
        },
      });

      // 3. Planned Finishing & Handover Task (linked to Final Installment)
      await prisma.workSchedule.create({
        data: {
          jobId: job.id,
          subContractId: contract.id,
          subcontractorId: sub.id,
          title: `งานเก็บรายละเอียดและตรวจรับส่งมอบงาน (${sub.name})`,
          description: 'เก็บซิลิโคน ติดตั้งบัวตัวจบ และทำความสะอาดส่งมอบงาน',
          taskCategory: 'ตรวจรับส่งมอบ',
          startDate: new Date(year, month, 22),
          endDate: new Date(year, month, 25),
          status: 'PLANNED',
          progressPercent: 0,
          linkedInstallmentNo: 3,
          targetAmount: 2500,
          notes: 'รอนัดหมายลูกค้าเข้าตรวจรับส่งมอบ',
        },
      });

      // 4. Delayed Task demo on another date
      await prisma.workSchedule.create({
        data: {
          jobId: job.id,
          subContractId: contract.id,
          subcontractorId: sub.id,
          title: `งานแก้งานรอยต่อบริเวณทางเดิน (${sub.name})`,
          description: 'รอยต่อพื้นกระเบื้องยางมีระยะห่างเกินมาตรฐาน',
          taskCategory: 'เก็บงาน/แก้ไข',
          startDate: new Date(year, month, 15),
          endDate: new Date(year, month, 16),
          status: 'DELAYED',
          progressPercent: 30,
          delayReason: 'รอวัสดุตัวจบจากซัพพลายเออร์ส่งเข้าหน้างาน',
          notes: 'ประสานงานเร่งจัดส่งวัสดุแล้ว คาดว่าจะถึงในวันถัดไป',
        },
      });
    }
  }

  console.log('Work Schedules seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
