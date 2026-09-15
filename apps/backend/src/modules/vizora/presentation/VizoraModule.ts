import { Express } from "express";
import { container } from "tsyringe";
import { BackendModule } from "@/infrastructure/BackendModule";
import { InMemoryVizoraRepository } from "../infrastructure/InMemoryVizoraRepository";
import { DashboardService } from "../application/services/DashboardService";
import { DataSourceService } from "../application/services/DataSourceService";
import { QueryExecutorService } from "../application/services/QueryExecutorService";
import { AutoGenerationService } from "../application/services/AutoGenerationService";
import { VizoraController } from "./VizoraController";
import type { IVizoraRepository } from "../domain/IVizoraRepository";
import type { IDashboardService } from "../application/contracts/IDashboardService";
import type { IDataSourceService } from "../application/contracts/IDataSourceService";
import type { IQueryExecutorService } from "../application/contracts/IQueryExecutorService";

export class VizoraModule implements BackendModule {
  register(app: Express): void {
    this.registerDependencies();
    this.registerRoutes(app);
  }

  private registerDependencies(): void {
    container.register<IVizoraRepository>("IVizoraRepository", { useClass: InMemoryVizoraRepository });
    container.register<IDashboardService>("IDashboardService", { useClass: DashboardService });
    container.register<IDataSourceService>("IDataSourceService", { useClass: DataSourceService });
    container.register<IQueryExecutorService>("IQueryExecutorService", { useClass: QueryExecutorService });
    container.register<AutoGenerationService>("AutoGenerationService", { useClass: AutoGenerationService });
  }

  private registerRoutes(app: Express): void {
    const ctrl = container.resolve(VizoraController);

    app.get("/api/vizora/health", (_req, res) => {
      res.json({ status: "ok", module: "vizora" });
    });

    app.get("/api/vizora/data-sources", ctrl.listDataSources);
    app.get("/api/vizora/tables", ctrl.searchTables);
    app.post("/api/vizora/query", ctrl.executeQuery);
    app.get("/api/vizora/distinct-values", ctrl.getDistinctValues);
    app.get("/api/vizora/numeric-bounds", ctrl.getNumericBounds);
    app.get("/api/vizora/table-schema/:tableName", ctrl.getTableSchema);

    app.get("/api/vizora/dashboards", ctrl.list);
    app.get("/api/vizora/dashboards/:id", ctrl.getById);
    app.post("/api/vizora/dashboards", ctrl.create);
    app.put("/api/vizora/dashboards/:id", ctrl.update);
    app.delete("/api/vizora/dashboards/:id", ctrl.delete);
    app.post("/api/vizora/dashboards/:id/duplicate", ctrl.duplicate);

    app.post("/api/vizora/auto-generate", ctrl.autoGenerate);
  }
}
