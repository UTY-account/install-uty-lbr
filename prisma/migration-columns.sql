-- Job missing columns
ALTER TABLE "Job" ADD COLUMN "customerPhone" TEXT;
ALTER TABLE "Job" ADD COLUMN "siteLocation" TEXT;
ALTER TABLE "Job" ADD COLUMN "googleMapsUrl" TEXT;
ALTER TABLE "Job" ADD COLUMN "startDate" DATETIME;
ALTER TABLE "Job" ADD COLUMN "endDate" DATETIME;

-- SubPayment missing columns
ALTER TABLE "SubPayment" ADD COLUMN "paymentStage" TEXT;

-- WorkSchedule missing columns
ALTER TABLE "WorkSchedule" ADD COLUMN "taskCategory" TEXT;
ALTER TABLE "WorkSchedule" ADD COLUMN "taggedStaff" TEXT;
ALTER TABLE "WorkSchedule" ADD COLUMN "linkedInstallmentNo" INTEGER;
ALTER TABLE "WorkSchedule" ADD COLUMN "targetAmount" REAL;
ALTER TABLE "WorkSchedule" ADD COLUMN "delayReason" TEXT;
