import type { QueryRequest, QueryResult } from './types';

const API_BASE = '/api/vizora';

export async function executeQuery(request: QueryRequest, signal?: AbortSignal): Promise<QueryResult> {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Query error ${res.status}: ${body || res.statusText}`);
  }

  return res.json();
}
