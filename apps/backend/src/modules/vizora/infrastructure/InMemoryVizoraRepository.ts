import { injectable } from "tsyringe";
import { okAsync } from "neverthrow";
import type { ResultAsync } from "neverthrow";
import type { DbError } from "@/shared/errors/AppError";
import type { IVizoraRepository } from "../domain/IVizoraRepository";
import type { Dashboard, DashboardVersion, UUID } from "../domain/entities";

@injectable()
export class InMemoryVizoraRepository implements IVizoraRepository {
  private readonly store = new Map<UUID, Dashboard>();
  private readonly versions = new Map<UUID, DashboardVersion[]>();

  findById(id: UUID, sede: string): ResultAsync<Dashboard | null, DbError> {
    const dashboard = this.store.get(id);
    if (!dashboard || dashboard.sede !== sede || !dashboard.isActive) {
      return okAsync(null);
    }
    return okAsync({ ...dashboard });
  }

  findBySede(sede: string, page: number, pageSize: number): ResultAsync<{ dashboards: Dashboard[]; totalCount: number }, DbError> {
    const all = [...this.store.values()].filter(d => d.sede === sede && d.isActive);
    all.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const start = (page - 1) * pageSize;
    const dashboards = all.slice(start, start + pageSize).map(d => ({ ...d }));
    return okAsync({ dashboards, totalCount: all.length });
  }

  create(dashboard: Dashboard): ResultAsync<Dashboard, DbError> {
    this.store.set(dashboard.id, { ...dashboard });
    return okAsync({ ...dashboard });
  }

  update(dashboard: Dashboard): ResultAsync<Dashboard, DbError> {
    this.store.set(dashboard.id, { ...dashboard });
    return okAsync({ ...dashboard });
  }

  softDelete(id: UUID, sede: string): ResultAsync<void, DbError> {
    const dashboard = this.store.get(id);
    if (dashboard && dashboard.sede === sede) {
      dashboard.isActive = false;
      dashboard.updatedAt = new Date();
    }
    return okAsync(undefined);
  }

  saveVersion(version: DashboardVersion): ResultAsync<void, DbError> {
    const versions = this.versions.get(version.dashboardId) || [];
    versions.push({ ...version });
    this.versions.set(version.dashboardId, versions);
    return okAsync(undefined);
  }
}
