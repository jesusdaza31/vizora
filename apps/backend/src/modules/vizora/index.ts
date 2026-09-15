export type {
  UUID, ISO8601String, VizoraType, WidgetType, Aggregation,
  FontSize, BorderRadius, ThemeConfig, LayoutConfig,
  DataSourceBinding, FilterBinding, ComponentConfig,
  FilterConfig, PageConfig, DashboardConfig,
  Dashboard, DashboardVersion, ColumnMetadata,
  DataSource, QueryResult, ConnectionStatus, DataSourceInfo,
} from "./domain/entities";
export type { IVizoraRepository } from "./domain/IVizoraRepository";
export {
  VizoraTableNotFoundError, VizoraDashboardNotFoundError,
  VizoraValidationError, VizoraConcurrencyConflictError,
  VizoraQueryTimeoutError, VizoraInvalidThemeTokenError,
} from "./domain/errors";
export type { VizoraDomainError } from "./domain/errors";
export type { DashboardDTO, CreateDashboardDTO, UpdateDashboardDTO, DashboardListDTO } from "./application/dtos/DashboardDTO";
export type { IDashboardService } from "./application/contracts/IDashboardService";
