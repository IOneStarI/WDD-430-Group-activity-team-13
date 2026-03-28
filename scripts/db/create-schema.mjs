import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";

import { marketplaceSchemaStatements } from "./schema.mjs";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

const sql = neon(process.env.DATABASE_URL);

for (const statement of marketplaceSchemaStatements) {
  await sql.query(statement);
}

console.log("Database schema is ready.");
