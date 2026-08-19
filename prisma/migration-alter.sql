-- Add salesOrderId to Job if not exists
ALTER TABLE "Job" ADD COLUMN "salesOrderId" TEXT;

-- Add salesOrderId to SubQuotation if not exists
ALTER TABLE "SubQuotation" ADD COLUMN "salesOrderId" TEXT;

-- Add paymentTerms to SubQuotation if not exists
ALTER TABLE "SubQuotation" ADD COLUMN "paymentTerms" TEXT;

-- Add paymentTerms to SubContract if not exists
ALTER TABLE "SubContract" ADD COLUMN "paymentTerms" TEXT;
