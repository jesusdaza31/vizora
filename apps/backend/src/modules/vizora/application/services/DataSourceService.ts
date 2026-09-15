import { injectable } from "tsyringe";
import { ResultAsync, okAsync, errAsync } from "neverthrow";
import { getPool, queryRaw } from "@vizora/database";
import { DbError } from "@/shared/errors/AppError";
import { classifySqlType } from "../../infrastructure/ColumnClassifier";
import type { IDataSourceService } from "../contracts/IDataSourceService";
import type { DataSourceListDTO, TableDTO, ColumnDTO } from "../dtos/DataSourceDTO";
import type { VizoraDomainError } from "../../domain/errors";

type RawTable = {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
};

type RawColumn = {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
};

type RawPrimaryKey = {
  COLUMN_NAME: string;
};

type RawRowCount = {
  table_schema: string;
  table_name: string;
  row_count: number;
};

@injectable()
export class DataSourceService implements IDataSourceService {
  listDataSources(): ResultAsync<DataSourceListDTO, DbError | VizoraDomainError> {
    return ResultAsync.fromPromise(this.fetchDataSources(), (e) => new DbError(e));
  }

  searchTables(
    search: string,
    limit: number,
    offset: number,
  ): ResultAsync<{ tables: TableDTO[]; totalCount: number }, DbError | VizoraDomainError> {
    return ResultAsync.fromPromise(this.searchTablesImpl(search, limit, offset), (e) => new DbError(e));
  }

  getTableColumns(
    tableSchema: string,
    tableName: string,
  ): ResultAsync<TableDTO | null, DbError | VizoraDomainError> {
    return ResultAsync.fromPromise(this.fetchTableColumns(tableSchema, tableName), (e) => new DbError(e));
  }

  getDistinctValues(
    table: string,
    column: string,
    limit: number,
  ): ResultAsync<{ values: unknown[]; count: number }, DbError | VizoraDomainError> {
    return ResultAsync.fromPromise(this.fetchDistinctValues(table, column, limit), (e) => new DbError(e));
  }

  getNumericBounds(
    table: string,
    column: string,
  ): ResultAsync<{ min: number | null; max: number | null }, DbError | VizoraDomainError> {
    return ResultAsync.fromPromise(this.fetchNumericBounds(table, column), (e) => new DbError(e));
  }

  private async fetchDataSources(): Promise<DataSourceListDTO> {
    try {
      await getPool();
    } catch (e) {
      return { tables: [], connectionStatus: "degraded", errorDetail: String(e) };
    }

    try {
      // Get top 50 tables only
      const tables = await queryRaw<RawTable>(
        `SELECT TOP 50 TABLE_SCHEMA, TABLE_NAME
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_TYPE = 'BASE TABLE'
         ORDER BY TABLE_NAME`,
      );

      const rowCounts = await queryRaw<RawRowCount>(
        `SELECT s.name AS table_schema, t.name AS table_name, p.rows AS row_count
         FROM sys.tables t
         INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
         INNER JOIN sys.partitions p ON t.object_id = p.object_id
         WHERE p.index_id IN (0, 1)
         ORDER BY s.name, t.name`,
      );

      const rowCountMap = new Map<string, number>();
      for (const rc of rowCounts) {
        rowCountMap.set(`${rc.table_schema}.${rc.table_name}`, rc.row_count);
      }

      const tableDTOs: TableDTO[] = [];

      for (const t of tables) {
        const columns = await this.fetchColumnsForTable(t.TABLE_SCHEMA, t.TABLE_NAME);
        const key = `${t.TABLE_SCHEMA}.${t.TABLE_NAME}`;
        tableDTOs.push({
          tableSchema: t.TABLE_SCHEMA,
          tableName: t.TABLE_NAME,
          columns,
          rowCountEstimate: rowCountMap.get(key) ?? 0,
        });
      }

      return { tables: tableDTOs, connectionStatus: "healthy" };
    } catch (e) {
      return { tables: [], connectionStatus: "degraded", errorDetail: String(e) };
    }
  }

  private async searchTablesImpl(
    search: string,
    limit: number,
    offset: number,
  ): Promise<{ tables: TableDTO[]; totalCount: number }> {
    try {
      await getPool();
    } catch (e) {
      return { tables: [], totalCount: 0 };
    }

    try {
      const searchPattern = `%${search}%`;

      // Get total count
      const countResult = await queryRaw<{ total: number }>(
        `SELECT COUNT(*) AS total
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_TYPE = 'BASE TABLE'
           AND TABLE_NAME LIKE @search`,
        { search: searchPattern },
      );
      const totalCount = countResult[0]?.total ?? 0;

      // Get paginated tables using OFFSET/FETCH
      const tables = await queryRaw<RawTable>(
        `SELECT TABLE_SCHEMA, TABLE_NAME
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_TYPE = 'BASE TABLE'
           AND TABLE_NAME LIKE @search
         ORDER BY TABLE_NAME
         OFFSET @offset ROWS
         FETCH NEXT @limit ROWS ONLY`,
        { search: searchPattern, limit, offset },
      );

      // Get row counts for these tables
      const tableNames = tables.map((t) => t.TABLE_NAME);
      const rowCounts = tableNames.length > 0 ? await queryRaw<RawRowCount>(
        `SELECT s.name AS table_schema, t.name AS table_name, p.rows AS row_count
         FROM sys.tables t
         INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
         INNER JOIN sys.partitions p ON t.object_id = p.object_id
         WHERE p.index_id IN (0, 1)
           AND t.name IN (${tableNames.map((_, i) => `@name${i}`).join(',')})
         ORDER BY s.name, t.name`,
        Object.fromEntries(tableNames.map((name, i) => [`name${i}`, name])),
      ) : [];

      const rowCountMap = new Map<string, number>();
      for (const rc of rowCounts) {
        rowCountMap.set(`${rc.table_schema}.${rc.table_name}`, rc.row_count);
      }

      // Don't fetch columns in list view - only fetch when table is selected
      const tableDTOs: TableDTO[] = tables.map((t) => {
        const key = `${t.TABLE_SCHEMA}.${t.TABLE_NAME}`;
        return {
          tableSchema: t.TABLE_SCHEMA,
          tableName: t.TABLE_NAME,
          columns: [], // Empty in list view - fetch on demand
          rowCountEstimate: rowCountMap.get(key) ?? 0,
        };
      });

      return { tables: tableDTOs, totalCount };
    } catch (e) {
      console.error('searchTables error:', e);
      return { tables: [], totalCount: 0 };
    }
  }

  private async fetchTableColumns(
    tableSchema: string,
    tableName: string,
  ): Promise<TableDTO | null> {
    const columns = await queryRaw<RawColumn>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = @schema AND TABLE_NAME = @table
       ORDER BY ORDINAL_POSITION`,
      { schema: tableSchema, table: tableName },
    );

    if (columns.length === 0) return null;

    const primaryKeys = await queryRaw<RawPrimaryKey>(
      `SELECT kcu.COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
         ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
         AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
         AND kcu.TABLE_NAME = tc.TABLE_NAME
       WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
         AND kcu.TABLE_SCHEMA = @schema
         AND kcu.TABLE_NAME = @table`,
      { schema: tableSchema, table: tableName },
    );

    const pkSet = new Set(primaryKeys.map((pk) => pk.COLUMN_NAME));

    const columnDTOs: ColumnDTO[] = columns.map((c) => ({
      name: c.COLUMN_NAME,
      sqlType: c.DATA_TYPE,
      vizoraType: classifySqlType(c.DATA_TYPE),
      isNullable: c.IS_NULLABLE === "YES",
      isPrimaryKey: pkSet.has(c.COLUMN_NAME),
    }));

    const rowCounts = await queryRaw<RawRowCount>(
      `SELECT s.name AS table_schema, t.name AS table_name, p.rows AS row_count
       FROM sys.tables t
       INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
       INNER JOIN sys.partitions p ON t.object_id = p.object_id
       WHERE p.index_id IN (0, 1)
         AND s.name = @schema
         AND t.name = @table`,
      { schema: tableSchema, table: tableName },
    );

    return {
      tableSchema,
      tableName,
      columns: columnDTOs,
      rowCountEstimate: rowCounts.length > 0 ? rowCounts[0].row_count : 0,
    };
  }

  private async fetchColumnsForTable(
    tableSchema: string,
    tableName: string,
  ): Promise<ColumnDTO[]> {
    const columns = await queryRaw<RawColumn>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = @schema AND TABLE_NAME = @table
       ORDER BY ORDINAL_POSITION`,
      { schema: tableSchema, table: tableName },
    );

    const primaryKeys = await queryRaw<RawPrimaryKey>(
      `SELECT kcu.COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
         ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
         AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
         AND kcu.TABLE_NAME = tc.TABLE_NAME
       WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
         AND kcu.TABLE_SCHEMA = @schema
         AND kcu.TABLE_NAME = @table`,
      { schema: tableSchema, table: tableName },
    );

    const pkSet = new Set(primaryKeys.map((pk) => pk.COLUMN_NAME));

    return columns.map((c) => ({
      name: c.COLUMN_NAME,
      sqlType: c.DATA_TYPE,
      vizoraType: classifySqlType(c.DATA_TYPE),
      isNullable: c.IS_NULLABLE === "YES",
      isPrimaryKey: pkSet.has(c.COLUMN_NAME),
    }));
  }

  private async fetchDistinctValues(
    table: string,
    column: string,
    limit: number,
  ): Promise<{ values: unknown[]; count: number }> {
    const rows = await queryRaw<{ value: unknown }>(
      `SELECT DISTINCT [${column.replace(/[\]]/g, "")}] AS value
       FROM [dbo].[${table.replace(/[\]]/g, "")}]
       WHERE [${column.replace(/[\]]/g, "")}] IS NOT NULL
       ORDER BY [${column.replace(/[\]]/g, "")}]
       OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`,
      { limit },
    );

    const values = rows.map((r) => r.value);
    return { values, count: values.length };
  }

  private async fetchNumericBounds(
    table: string,
    column: string,
  ): Promise<{ min: number | null; max: number | null }> {
    const rows = await queryRaw<{ min: number | null; max: number | null }>(
      `SELECT MIN([${column.replace(/[\]]/g, "")}]) AS min, MAX([${column.replace(/[\]]/g, "")}]) AS max
       FROM [dbo].[${table.replace(/[\]]/g, "")}]`,
    );

    if (rows.length === 0) {
      return { min: null, max: null };
    }

    return { min: rows[0].min, max: rows[0].max };
  }
}
