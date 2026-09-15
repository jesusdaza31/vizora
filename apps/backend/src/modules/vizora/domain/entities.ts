export type UUID = string;
export type ISO8601String = string;

export type VizoraType = 'string' | 'number' | 'date' | 'boolean';

export type WidgetType = 'kpi' | 'bar' | 'line' | 'pie' | 'table' | 'filter' | 'text';

export type Aggregation = 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';

export type FontSize = 'sm' | 'md' | 'lg';
export type BorderRadius = 8 | 12 | 16;

export type ThemeConfig = {
  primaryColor: string;
  chartPalette: string[];
  fontSize: FontSize;
  borderRadius: BorderRadius;
};

export type LayoutConfig = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DataSourceBinding = {
  table: string;
  columns: string[];
  aggregation?: Aggregation;
};

export type FilterBinding = {
  column: string;
  filterId: string;
};

export type ComponentConfig = {
  id: string;
  type: WidgetType;
  layout: LayoutConfig;
  dataSource: DataSourceBinding;
  filters: FilterBinding[];
  options: Record<string, unknown>;
};

export type FilterConfig = {
  id: string;
  column: string;
  vizoraType: VizoraType;
  label: string;
};

export type PageConfig = {
  id: string;
  name: string;
  components: ComponentConfig[];
};

export type DashboardConfig = {
  version: 1;
  theme: ThemeConfig;
  pages: PageConfig[];
};

export type Dashboard = {
  id: UUID;
  sede: string;
  name: string;
  description: string | null;
  config: DashboardConfig;
  version: number;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardVersion = {
  id: UUID;
  dashboardId: UUID;
  version: number;
  config: DashboardConfig;
  createdAt: Date;
};

export type ColumnMetadata = {
  name: string;
  sqlType: string;
  vizoraType: VizoraType;
  isNullable: boolean;
  isPrimaryKey: boolean;
};

export type DataSource = {
  tableSchema: string;
  tableName: string;
  columns: ColumnMetadata[];
  rowCountEstimate: number;
};

export type QueryResult = {
  data: Record<string, unknown>[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ConnectionStatus = 'healthy' | 'degraded';

export type DataSourceInfo = {
  tables: DataSource[];
  connectionStatus: ConnectionStatus;
  errorDetail?: string;
};
