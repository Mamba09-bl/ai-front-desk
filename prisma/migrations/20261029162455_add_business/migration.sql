-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "secretKeyHash" TEXT NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_publicKey_key" ON "businesses"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_secretKeyHash_key" ON "businesses"("secretKeyHash");
