const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearMockData() {
  console.log('🧹 Clearing mock/sample transactional data...');

  // 1. Delete transactional data
  await prisma.subPayment.deleteMany();
  await prisma.subContractItem.deleteMany();
  await prisma.subContract.deleteMany();
  await prisma.job.deleteMany();

  await prisma.subQuotationItem.deleteMany();
  await prisma.subQuotation.deleteMany();

  await prisma.itemRateHistory.deleteMany();
  await prisma.subcontractor.deleteMany();

  console.log('✓ All mock jobs, contracts, payments, quotations, and sample subcontractors have been removed.');
  console.log('✓ Companies and standard Item Master catalog are preserved for clean usage.');
}

clearMockData()
  .catch((e) => {
    console.error('Error clearing mock data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
