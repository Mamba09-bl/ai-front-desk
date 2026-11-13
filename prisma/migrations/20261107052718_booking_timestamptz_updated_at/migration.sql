/*
  Warnings:

  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "Booking_businessId_sessionId_idx" ON "Booking"("businessId", "sessionId");
