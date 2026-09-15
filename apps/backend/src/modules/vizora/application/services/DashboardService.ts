import { injectable, inject } from "tsyringe";
import { okAsync, errAsync, ResultAsync } from "neverthrow";
import { v4 as uuid } from "uuid";
import { DbError } from "@/shared/errors/AppError";
import type { IVizoraRepository } from "../../domain/IVizoraRepository";
import type { Dashboard, DashboardConfig, UUID } from "../../domain/entities";
import type { VizoraDomainError } from "../../domain/errors";
import { VizoraDashboardNotFoundError, VizoraValidationError, VizoraConcurrencyConflictError } from "../../domain/errors";
import type { IDashboardService } from "../contracts/IDashboardService";
import type { DashboardDTO, CreateDashboardDTO, UpdateDashboardDTO, DashboardListDTO } from "../dtos/DashboardDTO";
import { validateTheme } from "../../domain/theme-validation";

function toDTO(d: Dashboard): DashboardDTO {
  return {
    id: d.id,
    sede: d.sede,
    name: d.name,
    description: d.description,
    config: d.config,
    version: d.version,
    ownerId: d.ownerId,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

function validateConfig(config: DashboardConfig): VizoraValidationError | null {
  if (!config.pages || config.pages.length === 0) {
    return new VizoraValidationError("Dashboard config must have at least 1 page");
  }
  return null;
}

@injectable()
export class DashboardService implements IDashboardService {
  constructor(
    @inject("IVizoraRepository") private readonly repo: IVizoraRepository,
  ) {}

  create(dto: CreateDashboardDTO, sede: string, ownerId: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError> {
    const configError = validateConfig(dto.config);
    if (configError) return errAsync(configError);

    const themeResult = validateTheme(dto.config.theme);
    if (themeResult.isErr()) return errAsync(themeResult.error);

    const now = new Date();
    const dashboard: Dashboard = {
      id: uuid() as UUID,
      sede,
      name: dto.name,
      description: dto.description ?? null,
      config: dto.config,
      version: 1,
      ownerId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.create(dashboard).map(toDTO);
  }

  getById(id: string, sede: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError> {
    return this.repo.findById(id, sede).andThen((dashboard) => {
      if (!dashboard) return errAsync(new VizoraDashboardNotFoundError(id) as VizoraDomainError);
      return okAsync(toDTO(dashboard));
    });
  }

  update(id: string, dto: UpdateDashboardDTO, sede: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError> {
    const configError = validateConfig(dto.config);
    if (configError) return errAsync(configError);

    const themeResult = validateTheme(dto.config.theme);
    if (themeResult.isErr()) return errAsync(themeResult.error);

    return this.repo.findById(id, sede).andThen((existing) => {
      if (!existing) return errAsync(new VizoraDashboardNotFoundError(id) as VizoraDomainError);
      if (existing.version !== dto.version) {
        return errAsync(new VizoraConcurrencyConflictError(id, dto.version, existing.version) as VizoraDomainError);
      }

      const updated: Dashboard = {
        ...existing,
        name: dto.name ?? existing.name,
        description: dto.description !== undefined ? dto.description : existing.description,
        config: dto.config,
        version: existing.version + 1,
        updatedAt: new Date(),
      };

      return this.repo.update(updated).andThen(() =>
        this.repo.saveVersion({
          id: uuid() as UUID,
          dashboardId: id,
          version: updated.version,
          config: dto.config,
          createdAt: new Date(),
        }).map(() => toDTO(updated)),
      );
    });
  }

  delete(id: string, sede: string): ResultAsync<void, DbError | VizoraDomainError> {
    return this.repo.findById(id, sede).andThen((existing) => {
      if (!existing) return errAsync(new VizoraDashboardNotFoundError(id) as VizoraDomainError);
      return this.repo.softDelete(id, sede);
    });
  }

  duplicate(id: string, sede: string, ownerId: string): ResultAsync<DashboardDTO, DbError | VizoraDomainError> {
    return this.repo.findById(id, sede).andThen((existing) => {
      if (!existing) return errAsync(new VizoraDashboardNotFoundError(id) as VizoraDomainError);

      const now = new Date();
      const copy: Dashboard = {
        id: uuid() as UUID,
        sede,
        name: `${existing.name} (Copy)`,
        description: existing.description,
        config: JSON.parse(JSON.stringify(existing.config)),
        version: 1,
        ownerId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      return this.repo.create(copy).map(toDTO);
    });
  }

  list(sede: string, page: number, pageSize: number): ResultAsync<DashboardListDTO, DbError | VizoraDomainError> {
    return this.repo.findBySede(sede, page, pageSize).map(({ dashboards, totalCount }) => ({
      dashboards: dashboards.map(toDTO),
      totalCount,
      page,
      pageSize,
    }));
  }
}
