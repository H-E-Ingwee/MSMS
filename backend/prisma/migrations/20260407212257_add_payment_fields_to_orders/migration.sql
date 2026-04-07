-- AlterTable
ALTER TABLE "orders" ADD COLUMN "mpesaReceiptNumber" TEXT;
ALTER TABLE "orders" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "orders" ADD COLUMN "paymentMethod" TEXT;
