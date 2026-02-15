import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "path";

// Manually point to your .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // We use process.env directly here to ensure it's found
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});