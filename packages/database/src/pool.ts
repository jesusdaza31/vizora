import sql from "mssql";

let pool: sql.ConnectionPool | null = null;
let connecting: Promise<sql.ConnectionPool> | null = null;

type InternalConfig = { server: string; database: string; user: string; password: string; port: number; };
let dbConfig: InternalConfig | null = null;

export function configureDatabase(config: InternalConfig): void { dbConfig = config; }
export function getDbConfig(): InternalConfig {
  if (!dbConfig) throw new Error("Database not configured. Call configureDatabase() first.");
  return dbConfig;
}

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool?.connected) return pool;
  if (connecting) return connecting;
  if (!dbConfig) throw new Error("Database not configured. Call configureDatabase() first.");

  connecting = (async () => {
    const newPool = new sql.ConnectionPool({
      server: dbConfig!.server, database: dbConfig!.database, user: dbConfig!.user, password: dbConfig!.password, port: dbConfig!.port,
      options: { encrypt: false, trustServerCertificate: true },
      pool: { max: 10, min: 2, idleTimeoutMillis: 30000 },
    });

    await newPool.connect();
    pool = newPool;
    connecting = null;
    return newPool;
  })();

  return connecting;
}

export async function closePool(): Promise<void> {
  if (connecting) {
    try { await connecting; } catch { /* ignore connection errors during close */ }
  }
  if (pool) { await pool.close(); pool = null; }
  connecting = null;
}
