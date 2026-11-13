-- Rebuilds businesses to match schema.prisma: uuid ids, snake_case columns,
-- created_at, and an owner_id foreign key to users. Columns are dropped and
-- re-added, which is only safe because the table is still empty.

-- DropIndex
DROP INDEX "businesses_publicKey_key";

-- DropIndex
DROP INDEX "businesses_secretKeyHash_key";

-- AlterTable
ALTER TABLE "businesses" DROP CONSTRAINT "businesses_pkey",
DROP COLUMN "ownerId",
DROP COLUMN "publicKey",
DROP COLUMN "secretKeyHash",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "owner_id" UUID NOT NULL,
ADD COLUMN     "public_key" TEXT NOT NULL,
ADD COLUMN     "secret_key_hash" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(60),
ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_public_key_key" ON "businesses"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_secret_key_hash_key" ON "businesses"("secret_key_hash");

-- CreateIndex
CREATE INDEX "businesses_owner_id_idx" ON "businesses"("owner_id");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
