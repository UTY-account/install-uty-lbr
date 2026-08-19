-- CreateTable SalesOrder
CREATE TABLE IF NOT EXISTS "SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "soNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "salesPerson" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "siteLocation" TEXT NOT NULL,
    "googleMapsUrl" TEXT,
    "targetInstallDate" DATETIME,
    "targetFinishDate" DATETIME,
    "rescheduleReason" TEXT,
    "rescheduleHistory" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_CONTRACTOR',
    "onHoldReason" TEXT,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "cancelReason" TEXT,
    "cancelSettlement" TEXT,
    "notes" TEXT,
    "taggedStaff" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrder_soNumber_key" ON "SalesOrder"("soNumber");

-- CreateTable SalesOrderItem
CREATE TABLE IF NOT EXISTS "SalesOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "itemId" TEXT,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" TEXT,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable SiteVisitPhase
CREATE TABLE IF NOT EXISTS "SiteVisitPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "onHoldReason" TEXT,
    "notes" TEXT,
    "taggedStaff" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SiteVisitPhase_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable StaffMember
CREATE TABLE IF NOT EXISTS "StaffMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "lineUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable DefectTicket
CREATE TABLE IF NOT EXISTS "DefectTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT,
    "jobId" TEXT,
    "subcontractorId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "photos" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "actionType" TEXT NOT NULL DEFAULT 'FIX_BY_ORIGINAL',
    "deductAmount" REAL NOT NULL DEFAULT 0,
    "extraCost" REAL NOT NULL DEFAULT 0,
    "resolvedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DefectTicket_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DefectTicket_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DefectTicket_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
