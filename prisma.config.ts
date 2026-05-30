import path from "node:path";
import { defineConfig } from "prisma/config";
import { config as loadEnv } from "dotenv";

// Prisma config runs outside Next.js, so .env must be loaded manually
loadEnv({ path: path.resolve(process.cwd(), ".env") });

const datasourceUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: datasourceUrl,
  },
});
