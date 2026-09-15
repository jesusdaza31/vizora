import type { ResultAsync } from "neverthrow";
import type { DbError } from "@/shared/errors/AppError";
import type { DataSourceListDTO, TableDTO } from "../dtos/DataSourceDTO";
import type { VizoraDomainError } from "../../domain/errors";

export interface IDataSourceService {
  listDataSources(): ResultAsync<DataSourceListDTO, DbError | VizoraDomainError>;
  searchTables(
    search: string,
    limit: number,
    offset: number,
  ): ResultAsync<{ tables: TableDTO[]; totalCount: number }, DbError | VizoraDomainError>;
  getTableColumns(
    tableSchema: string,
    tableName: string,
  ): ResultAsync<TableDTO | null, DbError | VizoraDomainError>;
  getDistinctValues(
    table: string,
    column: string,
    limit: number,
  ): ResultAsync<{ values: unknown[]; count: number }, DbError | VizoraDomainError>;
  getNumericBounds(
    table: string,
    column: string,
  ): ResultAsync<{ min: number | null; max: number | null }, DbError | VizoraDomainError>;
}
