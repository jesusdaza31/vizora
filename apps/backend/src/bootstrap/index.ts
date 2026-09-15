import "reflect-metadata";
import express from "express";
import { env } from "@vizora/config";
import { configureDatabase } from "@vizora/database";
import { errorHandler } from "@/middleware/errorHandler";
import { modules } from "./modules";

console.log("Bootstrap starting...");
console.log("MSSQL_SERVER:", env.MSSQL_SERVER);
console.log("MSSQL_DATABASE:", env.MSSQL_DATABASE);
console.log("MSSQL_USER:", env.MSSQL_USER);
console.log("MSSQL_PORT:", env.MSSQL_PORT);

async function bootstrap(): Promise<void> {
  console.log("Step 1: Configuring database...");
  /* ── Database ─────────────────────────────────────────── */
  configureDatabase({
    server: env.MSSQL_SERVER,
    database: env.MSSQL_DATABASE,
    user: env.MSSQL_USER,
    password: env.MSSQL_PASSWORD,
    port: env.MSSQL_PORT,
  });
  console.log("Step 1 done");

  /* ─ Express app ──────────────────────────────────────── */
  console.log("Step 2: Creating Express app...");
  const app = express();
  console.log("Step 2 done");

  /* ── CORS ──────────────────────────────────────────────── */
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json());

  /* ── Register modules ──────────────────────────────────── */
  console.log("Step 3: Registering modules...");
  for (const mod of modules) {
    console.log("  -", mod.constructor.name);
    mod.register(app);
  }
  console.log("Step 3 done");

  /* ── Error handler (RFC 9457) ─────────────────────────── */
  app.use(errorHandler);

  /* ── Start ─────────────────────────────────────────────── */
  console.log(`Step 4: Listening on port ${env.PORT}...`);
  app.listen(env.PORT, () => {
    console.log(`✓ Vizora backend running on http://localhost:${env.PORT}`);
  });
}

void bootstrap().catch((err) => {
  console.error("Failed to bootstrap server:", err);
  process.exit(1);
});
