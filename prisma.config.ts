import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// Next.js loads .env.local for the app; the Prisma CLI doesn't, so load it here.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
