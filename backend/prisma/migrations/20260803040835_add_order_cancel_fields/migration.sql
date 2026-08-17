-- CreateEnum
CREATE TYPE "CancelReason" AS ENUM ('CUSTOMER_REQUEST', 'OUT_OF_STOCK', 'PAYMENT_FAILED', 'DUPLICATE_ORDER', 'OTHER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelReason" "CancelReason",
ADD COLUMN     "cancelReasonNote" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "eggCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
