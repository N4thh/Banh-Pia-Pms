/*
  Warnings:

  - A unique constraint covering the columns `[kind]` on the table `Cake` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cake_kind_key" ON "Cake"("kind");
