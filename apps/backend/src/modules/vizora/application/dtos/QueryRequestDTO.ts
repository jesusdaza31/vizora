import type { Aggregation } from "../../domain/entities";

export type QueryRequestDTO = {
  table: string;
  columns: string[];
  aggregation?: { column: string; function: Aggregation };
  groupBy?: string[];
  filters?: Record<string, unknown>;
  orderBy?: { column: string; direction: "ASC" | "DESC" };
  page?: number;
  pageSize?: number;
};
