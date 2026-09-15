import type { ResultAsync } from "neverthrow";
import type { DbError } from "@/shared/errors/AppError";
import type { Dashboard, DashboardVersion, UUID } from "./entities";

export interface IVizoraRepository {
  findById(id: UUID, sede: string): ResultAsync<Dashboard | null, DbError>;
  findBySede(sede: string, page: number, pageSize: number): ResultAsync<{ dashboards: Dashboard[]; totalCount: number }, DbError>;
  create(dashboard: Dashboard): ResultAsync<Dashboard, DbError>;
  update(dashboard: Dashboard): ResultAsync<Dashboard, DbError>;
  softDelete(id: UUID, sede: string): ResultAsync<void, DbError>;
  saveVersion(version: DashboardVersion): ResultAsync<void, DbError>;
}
