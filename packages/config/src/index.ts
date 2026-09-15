import { z } from "zod";
import { config } from "dotenv";
import path from "path";

// Load .env from backend directory
const envPath = path.resolve(process.cwd(), ".env");
console.log("Loading .env from:", envPath);
config({ path: envPath, override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).default(5279),
  MSSQL_SERVER: z.string().default("localhost"),
  MSSQL_DATABASE: z.string().default("vizora"),
  MSSQL_USER: z.string().default(""),
  MSSQL_PASSWORD: z.string().default(""),
  MSSQL_PORT: z.coerce.number().int().min(1).default(1433),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:");
  console.error(result.error.message);
  process.exit(1);
}

export const env = result.data;
export type Env = z.infer<typeof envSchema>;
