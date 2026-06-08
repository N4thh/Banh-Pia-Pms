-- CreateEnum
CREATE TYPE "PaymentLinkStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "checkoutUrl" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" "PaymentLinkStatus" NOT NULL DEFAULT 'PENDING',
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amountRemaining" DECIMAL(65,30) NOT NULL,
    "cancellationReason" TEXT,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" SERIAL NOT NULL,
    "paymentLinkId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "transactionDateTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "counterAccountNumber" TEXT,
    "counterAccountName" TEXT,
    "counterAccountBank" TEXT,
    "signatureValid" BOOLEAN NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_orderId_key" ON "PaymentLink"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_reference_key" ON "PaymentTransaction"("reference");

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "PaymentLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
