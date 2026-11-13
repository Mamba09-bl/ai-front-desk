-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Case-insensitive uniqueness (not expressible in schema.prisma).
-- Names must match the lookup in app/api/signup/route.ts.
CREATE UNIQUE INDEX "users_username_key" ON "users" (lower("username"));
CREATE UNIQUE INDEX "users_email_key" ON "users" (lower("email"));
