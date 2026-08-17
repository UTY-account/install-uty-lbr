const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (val instanceof Date) return `'${val.toISOString()}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function exportData() {
  console.log('Exporting data from local SQLite to SQL file...');

  const companies = await prisma.company.findMany();
  const subcontractors = await prisma.subcontractor.findMany();
  const items = await prisma.item.findMany();
  const itemRateHistories = await prisma.itemRateHistory.findMany();
  const jobs = await prisma.job.findMany();
  const subContracts = await prisma.subContract.findMany();
  const subContractItems = await prisma.subContractItem.findMany();
  const subPayments = await prisma.subPayment.findMany();
  const subQuotations = await prisma.subQuotation.findMany();
  const subQuotationItems = await prisma.subQuotationItem.findMany();
  const workSchedules = await prisma.workSchedule.findMany();

  let sql = '-- Exported Data for Cloudflare D1\n\n';

  for (const c of companies) {
    sql += `INSERT OR REPLACE INTO "Company" ("id", "code", "nameTh", "nameEn", "taxId", "phone", "email", "address", "logoUrl", "bankInfo", "createdAt", "updatedAt") VALUES (${escapeSql(c.id)}, ${escapeSql(c.code)}, ${escapeSql(c.nameTh)}, ${escapeSql(c.nameEn)}, ${escapeSql(c.taxId)}, ${escapeSql(c.phone)}, ${escapeSql(c.email)}, ${escapeSql(c.address)}, ${escapeSql(c.logoUrl)}, ${escapeSql(c.bankInfo)}, ${escapeSql(c.createdAt)}, ${escapeSql(c.updatedAt)});\n`;
  }

  for (const s of subcontractors) {
    const photoUrl = s.idCardPhotoUrl && s.idCardPhotoUrl.startsWith('data:image') ? '/uploads/mock-idcard.jpg' : s.idCardPhotoUrl;
    sql += `INSERT OR REPLACE INTO "Subcontractor" ("id", "idCard", "name", "phone", "bankName", "bankAccountNo", "bankAccountName", "idCardPhotoUrl", "idCardStatus", "skills", "address", "status", "notes", "createdAt", "updatedAt") VALUES (${escapeSql(s.id)}, ${escapeSql(s.idCard)}, ${escapeSql(s.name)}, ${escapeSql(s.phone)}, ${escapeSql(s.bankName)}, ${escapeSql(s.bankAccountNo)}, ${escapeSql(s.bankAccountName)}, ${escapeSql(photoUrl)}, ${escapeSql(s.idCardStatus)}, ${escapeSql(s.skills)}, ${escapeSql(s.address)}, ${escapeSql(s.status)}, ${escapeSql(s.notes)}, ${escapeSql(s.createdAt)}, ${escapeSql(s.updatedAt)});\n`;
  }

  for (const it of items) {
    sql += `INSERT OR REPLACE INTO "Item" ("id", "code", "name", "category", "unit", "standardRate", "description", "createdAt", "updatedAt") VALUES (${escapeSql(it.id)}, ${escapeSql(it.code)}, ${escapeSql(it.name)}, ${escapeSql(it.category)}, ${escapeSql(it.unit)}, ${escapeSql(it.standardRate)}, ${escapeSql(it.description)}, ${escapeSql(it.createdAt)}, ${escapeSql(it.updatedAt)});\n`;
  }

  for (const ir of itemRateHistories) {
    sql += `INSERT OR REPLACE INTO "ItemRateHistory" ("id", "itemId", "subcontractorId", "unitRate", "jobCode", "jobTitle", "recordedAt", "notes") VALUES (${escapeSql(ir.id)}, ${escapeSql(ir.itemId)}, ${escapeSql(ir.subcontractorId)}, ${escapeSql(ir.unitRate)}, ${escapeSql(ir.jobCode)}, ${escapeSql(ir.jobTitle)}, ${escapeSql(ir.recordedAt)}, ${escapeSql(ir.notes)});\n`;
  }

  for (const j of jobs) {
    sql += `INSERT OR REPLACE INTO "Job" ("id", "companyId", "jobCode", "title", "customerName", "customerPhone", "siteLocation", "status", "startDate", "endDate", "notes", "createdAt", "updatedAt") VALUES (${escapeSql(j.id)}, ${escapeSql(j.companyId)}, ${escapeSql(j.jobCode)}, ${escapeSql(j.title)}, ${escapeSql(j.customerName)}, ${escapeSql(j.customerPhone)}, ${escapeSql(j.siteLocation)}, ${escapeSql(j.status)}, ${escapeSql(j.startDate)}, ${escapeSql(j.endDate)}, ${escapeSql(j.notes)}, ${escapeSql(j.createdAt)}, ${escapeSql(j.updatedAt)});\n`;
  }

  for (const sc of subContracts) {
    sql += `INSERT OR REPLACE INTO "SubContract" ("id", "jobId", "subcontractorId", "contractCode", "contractDate", "totalContractAmount", "extraAmount", "deductAmount", "status", "notes", "createdAt", "updatedAt") VALUES (${escapeSql(sc.id)}, ${escapeSql(sc.jobId)}, ${escapeSql(sc.subcontractorId)}, ${escapeSql(sc.contractCode)}, ${escapeSql(sc.contractDate)}, ${escapeSql(sc.totalContractAmount)}, ${escapeSql(sc.extraAmount)}, ${escapeSql(sc.deductAmount)}, ${escapeSql(sc.status)}, ${escapeSql(sc.notes)}, ${escapeSql(sc.createdAt)}, ${escapeSql(sc.updatedAt)});\n`;
  }

  for (const sci of subContractItems) {
    sql += `INSERT OR REPLACE INTO "SubContractItem" ("id", "subContractId", "itemId", "itemCode", "itemName", "quantity", "unit", "unitRate", "totalAmount", "notes") VALUES (${escapeSql(sci.id)}, ${escapeSql(sci.subContractId)}, ${escapeSql(sci.itemId)}, ${escapeSql(sci.itemCode)}, ${escapeSql(sci.itemName)}, ${escapeSql(sci.quantity)}, ${escapeSql(sci.unit)}, ${escapeSql(sci.unitRate)}, ${escapeSql(sci.totalAmount)}, ${escapeSql(sci.notes)});\n`;
  }

  for (const p of subPayments) {
    const slip = p.slipUrl && p.slipUrl.startsWith('data:image') ? '/uploads/mock-slip.jpg' : p.slipUrl;
    sql += `INSERT OR REPLACE INTO "SubPayment" ("id", "subContractId", "installmentNo", "paymentDate", "amount", "whtRate", "whtAmount", "netAmount", "slipUrl", "refNo", "notes", "status", "editHistory", "createdAt", "updatedAt") VALUES (${escapeSql(p.id)}, ${escapeSql(p.subContractId)}, ${escapeSql(p.installmentNo)}, ${escapeSql(p.paymentDate)}, ${escapeSql(p.amount)}, ${escapeSql(p.whtRate)}, ${escapeSql(p.whtAmount)}, ${escapeSql(p.netAmount)}, ${escapeSql(slip)}, ${escapeSql(p.refNo)}, ${escapeSql(p.notes)}, ${escapeSql(p.status)}, ${escapeSql(p.editHistory)}, ${escapeSql(p.createdAt)}, ${escapeSql(p.updatedAt)});\n`;
  }

  for (const q of subQuotations) {
    sql += `INSERT OR REPLACE INTO "SubQuotation" ("id", "companyId", "subcontractorId", "quotationNo", "quotationDate", "validUntil", "projectName", "subtotal", "whtRate", "whtAmount", "grandTotal", "status", "notes", "convertedJobId", "convertedContractId", "createdAt", "updatedAt") VALUES (${escapeSql(q.id)}, ${escapeSql(q.companyId)}, ${escapeSql(q.subcontractorId)}, ${escapeSql(q.quotationNo)}, ${escapeSql(q.quotationDate)}, ${escapeSql(q.validUntil)}, ${escapeSql(q.projectName)}, ${escapeSql(q.subtotal)}, ${escapeSql(q.whtRate)}, ${escapeSql(q.whtAmount)}, ${escapeSql(q.grandTotal)}, ${escapeSql(q.status)}, ${escapeSql(q.notes)}, ${escapeSql(q.convertedJobId)}, ${escapeSql(q.convertedContractId)}, ${escapeSql(q.createdAt)}, ${escapeSql(q.updatedAt)});\n`;
  }

  for (const qi of subQuotationItems) {
    sql += `INSERT OR REPLACE INTO "SubQuotationItem" ("id", "quotationId", "itemId", "itemCode", "itemName", "quantity", "unit", "unitRate", "totalAmount", "notes") VALUES (${escapeSql(qi.id)}, ${escapeSql(qi.quotationId)}, ${escapeSql(qi.itemId)}, ${escapeSql(qi.itemCode)}, ${escapeSql(qi.itemName)}, ${escapeSql(qi.quantity)}, ${escapeSql(qi.unit)}, ${escapeSql(qi.unitRate)}, ${escapeSql(qi.totalAmount)}, ${escapeSql(qi.notes)});\n`;
  }

  for (const ws of workSchedules) {
    sql += `INSERT OR REPLACE INTO "WorkSchedule" ("id", "jobId", "subContractId", "subcontractorId", "taskTitle", "startDate", "endDate", "status", "progressPercent", "notes", "delayReason", "paymentMilestone", "createdAt", "updatedAt") VALUES (${escapeSql(ws.id)}, ${escapeSql(ws.jobId)}, ${escapeSql(ws.subContractId)}, ${escapeSql(ws.subcontractorId)}, ${escapeSql(ws.taskTitle)}, ${escapeSql(ws.startDate)}, ${escapeSql(ws.endDate)}, ${escapeSql(ws.status)}, ${escapeSql(ws.progressPercent)}, ${escapeSql(ws.notes)}, ${escapeSql(ws.delayReason)}, ${escapeSql(ws.paymentMilestone)}, ${escapeSql(ws.createdAt)}, ${escapeSql(ws.updatedAt)});\n`;
  }

  const outPath = path.join(__dirname, 'seed-d1.sql');
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`Successfully generated ${outPath}`);
  await prisma.$disconnect();
}

exportData().catch(console.error);
