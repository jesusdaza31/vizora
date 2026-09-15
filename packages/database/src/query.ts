import { getPool } from "./pool";

export async function query<T>(strings: TemplateStringsArray, ...params: any[]): Promise<T[]> {
  const pool = await getPool();

  let rawSql = strings[0];
  for (let i = 0; i < params.length; i++) rawSql += `@p${i}` + strings[i + 1];

  const request = pool.request();
  for (let i = 0; i < params.length; i++) request.input(`p${i}`, params[i]);

  const result = await request.query(rawSql);
  return result.recordset as T[];
}

export async function queryRaw<T>(sqlTemplate: string, params?: Record<string, any>): Promise<T[]> {
  const pool = await getPool();

  const request = pool.request();
  if (params) for (const [key, value] of Object.entries(params)) request.input(key, value);

  const result = await request.query(sqlTemplate);
  return result.recordset as T[];
}
