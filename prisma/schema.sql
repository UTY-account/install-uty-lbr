-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "taxId" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bankInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subcontractor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idCard" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "bankAccountName" TEXT,
    "idCardPhotoUrl" TEXT,
    "idCardStatus" TEXT NOT NULL DEFAULT 'PENDING_ATTACHMENT',
    "skills" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" TEXT NOT NULL,
    "standardRate" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ItemRateHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "subcontractorId" TEXT NOT NULL,
    "unitRate" REAL NOT NULL,
    "jobCode" TEXT,
    "jobTitle" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "ItemRateHistory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemRateHistory_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "siteLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubContract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "subcontractorId" TEXT NOT NULL,
    "contractCode" TEXT NOT NULL,
    "contractDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalContractAmount" REAL NOT NULL DEFAULT 0,
    "extraAmount" REAL NOT NULL DEFAULT 0,
    "deductAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubContract_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubContract_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubContractItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subContractId" TEXT NOT NULL,
    "itemId" TEXT,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "SubContractItem_subContractId_fkey" FOREIGN KEY ("subContractId") REFERENCES "SubContract" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubContractItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subContractId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "whtRate" REAL NOT NULL DEFAULT 3.0,
    "whtAmount" REAL NOT NULL,
    "netAmount" REAL NOT NULL,
    "slipUrl" TEXT,
    "refNo" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "editHistory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubPayment_subContractId_fkey" FOREIGN KEY ("subContractId") REFERENCES "SubContract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "subContractId" TEXT,
    "subcontractorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskCategory" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "linkedInstallmentNo" INTEGER,
    "targetAmount" REAL,
    "delayReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkSchedule_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkSchedule_subContractId_fkey" FOREIGN KEY ("subContractId") REFERENCES "SubContract" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkSchedule_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubQuotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "subcontractorId" TEXT NOT NULL,
    "quotationNo" TEXT NOT NULL,
    "quotationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME,
    "projectName" TEXT NOT NULL,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "whtRate" REAL NOT NULL DEFAULT 3.0,
    "whtAmount" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "convertedJobId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubQuotation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SubQuotation_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubQuotationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subQuotationId" TEXT NOT NULL,
    "itemId" TEXT,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "SubQuotationItem_subQuotationId_fkey" FOREIGN KEY ("subQuotationId") REFERENCES "SubQuotation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubQuotationItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subcontractor_idCard_key" ON "Subcontractor"("idCard");

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobCode_key" ON "Job"("jobCode");

-- CreateIndex
CREATE UNIQUE INDEX "SubContract_contractCode_key" ON "SubContract"("contractCode");

-- CreateIndex
CREATE UNIQUE INDEX "SubQuotation_quotationNo_key" ON "SubQuotation"("quotationNo");

