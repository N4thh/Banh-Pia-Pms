/*
  Warnings:

  - Added the required column `receiveDate` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "receiveDate" TIMESTAMP(3) NOT NULL;
