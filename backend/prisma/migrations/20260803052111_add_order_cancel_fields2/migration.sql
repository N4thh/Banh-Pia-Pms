/*
  Warnings:

  - The values [PAYMENT_FAILED] on the enum `CancelReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CancelReason_new" AS ENUM ('CUSTOMER_REQUEST', 'OUT_OF_STOCK', 'PAYMENT_EXPIRED', 'DUPLICATE_ORDER', 'OTHER');
ALTER TABLE "Order" ALTER COLUMN "cancelReason" TYPE "CancelReason_new" USING ("cancelReason"::text::"CancelReason_new");
ALTER TYPE "CancelReason" RENAME TO "CancelReason_old";
ALTER TYPE "CancelReason_new" RENAME TO "CancelReason";
DROP TYPE "CancelReason_old";
COMMIT;
