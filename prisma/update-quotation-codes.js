const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateQuotationCodes() {
  const quotations = await prisma.subQuotation.findMany({
    include: { company: true },
  });

  console.log(`Found ${quotations.length} quotations to check.`);

  for (let i = 0; i < quotations.length; i++) {
    const q = quotations[i];
    const date = new Date(q.quotationDate);
    const year2 = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const seq = (i + 1).toString().padStart(4, '0');
    const newNo = `${q.company.code}-QT-${year2}${month}-${seq}`;

    if (q.quotationNo !== newNo) {
      await prisma.subQuotation.update({
        where: { id: q.id },
        data: { quotationNo: newNo },
      });
      console.log(`Updated: ${q.quotationNo} -> ${newNo}`);
    }
  }

  console.log('Quotation code format update complete.');
  await prisma.$disconnect();
}

updateQuotationCodes().catch(err => {
  console.error(err);
  process.exit(1);
});
