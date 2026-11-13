-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "allowed_domains" TEXT[] DEFAULT ARRAY[]::TEXT[];
