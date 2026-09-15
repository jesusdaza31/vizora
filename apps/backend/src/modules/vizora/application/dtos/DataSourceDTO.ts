import type { ConnectionStatus, ColumnMetadata } from "../../domain/entities";

export type ColumnDTO = {
  name: string;
  sqlType: string;
  vizoraType: ColumnMetadata["vizoraType"];
  isNullable: boolean;
  isPrimaryKey: boolean;
};

export type TableDTO = {
  tableSchema: string;
  tableName: string;
  columns: ColumnDTO[];
  rowCountEstimate: number;
};

export type DataSourceListDTO = {
  tables: TableDTO[];
  connectionStatus: ConnectionStatus;
  errorDetail?: string;
};
