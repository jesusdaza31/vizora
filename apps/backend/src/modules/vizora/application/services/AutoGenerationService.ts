import { injectable, inject } from "tsyringe";
import { ResultAsync } from "neverthrow";
import { DbError } from "@/shared/errors/AppError";
import { VizoraTableNotFoundError, VizoraValidationError } from "../../domain/errors";
import type { IDataSourceService } from "../contracts/IDataSourceService";
import type { VizoraDomainError } from "../../domain/errors";
import type {
  DashboardConfig,
  ComponentConfig,
  PageConfig,
  VizoraType,
  WidgetType,
} from "../../domain/entities";

type ColumnAnalysis = {
  name: string;
  vizoraType: VizoraType;
  nullableRatio: number;
  isPrimaryKey: boolean;
};

type TableAnalysis = {
  tableName: string;
  tableSchema: string;
  rowCount: number;
  columns: ColumnAnalysis[];
  distribution: {
    numericCount: number;
    dateCount: number;
    stringCount: number;
    booleanCount: number;
  };
};

type ProposalResult = {
  config: DashboardConfig;
  isPartial: boolean;
};

const GENERATION_TIMEOUT_MS = 5000;

const DEFAULT_THEME: DashboardConfig["theme"] = {
  primaryColor: "#0d9488",
  chartPalette: ["#0d9488", "#14b8a6", "#06b6d4", "#22d3ee", "#f59e0b", "#ef4444"],
  fontSize: "md",
  borderRadius: 12,
};

@injectable()
export class AutoGenerationService {
  constructor(
    @inject("IDataSourceService") private readonly dataSourceService: IDataSourceService,
  ) {}

  generateProposal(tableName: string): ResultAsync<ProposalResult, DbError | VizoraDomainError> {
    return ResultAsync.fromPromise(this.runGeneration(tableName), (e: unknown) => {
      if (e instanceof VizoraTableNotFoundError || e instanceof VizoraValidationError) return e;
      return new DbError(e);
    });
  }

  private async runGeneration(tableName: string): Promise<ProposalResult> {
    const analysis = await this.analyzeTable(tableName);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

    try {
      const config = this.buildConfig(analysis);
      return { config, isPartial: false };
    } catch {
      const partialConfig = this.buildPartialConfig(analysis);
      return { config: partialConfig, isPartial: true };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async analyzeTable(tableName: string): Promise<TableAnalysis> {
    const tableResult = await this.dataSourceService.getTableColumns("dbo", tableName);
    const table = tableResult._unsafeUnwrap();

    if (!table) {
      const allSources = await this.dataSourceService.listDataSources();
      const sources = allSources._unsafeUnwrap();
      const found = sources.tables.find((t: { tableName: string }) => t.tableName === tableName);
      if (!found) throw new VizoraTableNotFoundError(tableName);

      const tableResult2 = await this.dataSourceService.getTableColumns(found.tableSchema, tableName);
      const table2 = tableResult2._unsafeUnwrap();
      if (!table2) throw new VizoraTableNotFoundError(tableName);
      return this.buildAnalysis(table2.tableSchema, table2.tableName, table2.rowCountEstimate, table2.columns);
    }

    return this.buildAnalysis(table.tableSchema, table.tableName, table.rowCountEstimate, table.columns);
  }

  private async buildAnalysis(
    tableSchema: string,
    tableName: string,
    rowCount: number,
    columns: { name: string; vizoraType: VizoraType; isNullable: boolean; isPrimaryKey: boolean }[],
  ): Promise<TableAnalysis> {
    const distribution = { numericCount: 0, dateCount: 0, stringCount: 0, booleanCount: 0 };
    const columnAnalyses: ColumnAnalysis[] = [];

    for (const col of columns) {
      switch (col.vizoraType) {
        case "number": distribution.numericCount++; break;
        case "date": distribution.dateCount++; break;
        case "boolean": distribution.booleanCount++; break;
        default: distribution.stringCount++; break;
      }

      columnAnalyses.push({
        name: col.name,
        vizoraType: col.vizoraType,
        nullableRatio: col.isNullable ? 1 : 0,
        isPrimaryKey: col.isPrimaryKey,
      });
    }

    return { tableName, tableSchema, rowCount, columns: columnAnalyses, distribution };
  }

  private buildConfig(analysis: TableAnalysis): DashboardConfig {
    const components: ComponentConfig[] = [];
    const { columns, distribution, rowCount, tableName } = analysis;
    const qualifiedTable = `${analysis.tableSchema}.${tableName}`;
    let yOffset = 0;

    const dateCol = columns.find((c) => c.vizoraType === "date");
    const numericCols = columns.filter((c) => c.vizoraType === "number");
    const stringCols = columns.filter((c) => c.vizoraType === "string");
    const categoricalCols = stringCols.filter(() => rowCount < 500);

    if (rowCount < 100) {
      components.push(this.makeComponent("table-1", "table", qualifiedTable, columns.map((c) => c.name), 0, yOffset, 12, 6));
      yOffset += 6;
    } else {
      if (numericCols.length >= 1) {
        const kpiCount = Math.min(numericCols.length, 4);
        const kpiWidth = Math.floor(12 / kpiCount);
        for (let i = 0; i < kpiCount; i++) {
          const col = numericCols[i];
          components.push(
            this.makeComponent(`kpi-${i}`, "kpi", qualifiedTable, [col.name], i * kpiWidth, yOffset, kpiWidth, 2, {
              aggregation: "SUM",
              label: col.name,
            }),
          );
        }
        yOffset += 2;
      }

      if (dateCol && numericCols.length >= 1) {
        components.push(
          this.makeComponent("line-1", "line", qualifiedTable, [dateCol.name, numericCols[0].name], 0, yOffset, 8, 4),
        );
        if (numericCols.length >= 2) {
          components.push(
            this.makeComponent("bar-1", "bar", qualifiedTable, [numericCols[1].name], 8, yOffset, 4, 4),
          );
        }
        yOffset += 4;
      } else if (numericCols.length >= 3) {
        components.push(
          this.makeComponent("bar-1", "bar", qualifiedTable, numericCols.slice(0, 3).map((c) => c.name), 0, yOffset, 6, 4),
        );
        components.push(
          this.makeComponent("pie-1", "pie", qualifiedTable, [numericCols[3]?.name ?? numericCols[0].name], 6, yOffset, 6, 4),
        );
        yOffset += 4;
      }

      if (categoricalCols.length >= 1) {
        components.push(
          this.makeComponent("filter-1", "filter", qualifiedTable, [categoricalCols[0].name], 0, yOffset, 3, 1, {
            label: categoricalCols[0].name,
          }),
        );
      }

      components.push(
        this.makeComponent("table-1", "table", qualifiedTable, columns.map((c) => c.name), 0, yOffset + 1, 12, 5),
      );
    }

    const page: PageConfig = {
      id: "page-1",
      name: tableName,
      components,
    };

    return { version: 1, theme: DEFAULT_THEME, pages: [page] };
  }

  private buildPartialConfig(analysis: TableAnalysis): DashboardConfig {
    const qualifiedTable = `${analysis.tableSchema}.${analysis.tableName}`;
    const columns = analysis.columns;

    const page: PageConfig = {
      id: "page-1",
      name: analysis.tableName,
      components: [
        this.makeComponent("table-1", "table", qualifiedTable, columns.map((c) => c.name), 0, 0, 12, 6),
      ],
    };

    return { version: 1, theme: DEFAULT_THEME, pages: [page] };
  }

  private makeComponent(
    id: string,
    type: WidgetType,
    table: string,
    cols: string[],
    x: number,
    y: number,
    w: number,
    h: number,
    options: Record<string, unknown> = {},
  ): ComponentConfig {
    return {
      id,
      type,
      layout: { x, y, w, h },
      dataSource: { table, columns: cols },
      filters: [],
      options,
    };
  }
}
