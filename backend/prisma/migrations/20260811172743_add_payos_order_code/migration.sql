/*
  Warnings:

  - A unique constraint covering the columns `[payosOrderCode]` on the table `PaymentLink` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentLink" ADD COLUMN     "payosOrderCode" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_payosOrderCode_key" ON "PaymentLink"("payosOrderCode");
