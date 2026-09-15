import type { ResultAsync } from "neverthrow";
import type { VizoraDomainError } from "../../domain/errors";
import type { DbError } from "@/shared/errors/AppError";
import type { DashboardDTO, CreateDashboardDTO, UpdateDashboardDTO, DashboardListDTO } from "../dtos/DashboardDTO";

export interface IDashboardService {
  create(dto: CreateDashboardDTO, sede: string, ownerId: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError>;
  getById(id: string, sede: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError>;
  update(id: string, dto: UpdateDashboardDTO, sede: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError>;
  delete(id: string, sede: string): ResultAsync<void, DbError | VizoraDomainError>;
  duplicate(id: string, sede: string, ownerId: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError>;
  list(sede: string, page: number, pageSize: number): ResultAsync<DashboardListDTO, DbError | VizoraDomainError>;
}
