-- CreateTable
CREATE TABLE "VisitLog" (
    "id" BIGSERIAL NOT NULL,
    "userId" INTEGER,
    "deviceType" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitLog_createdAt_idx" ON "VisitLog"("createdAt");

-- CreateIndex
CREATE INDEX "VisitLog_userId_createdAt_idx" ON "VisitLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "VisitLog" ADD CONSTRAINT "VisitLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
