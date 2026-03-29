// Prisma configuration for Stockscope
// Loads environment variables from .env.local
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local (Next.js convention)
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
