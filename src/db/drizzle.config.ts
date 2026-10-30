import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connString = process.env.DATABASE_URL || 'mysql://u822437904_m2m_admin:Hareem%40sep2026@srv2108.hstgr.io:3306/u822437904_map2medic';

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connString,
  },
  verbose: true,
});
