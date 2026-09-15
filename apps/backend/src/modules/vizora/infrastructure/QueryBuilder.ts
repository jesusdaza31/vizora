import type { Aggregation } from "../domain/entities";

export type QueryBuildRequest = {
  table: string;
  columns: string[];
  aggregation?: { column: string; function: Aggregation };
  groupBy?: string[];
  filters?: Record<string, unknown>;
  orderBy?: { column: string; direction: "ASC" | "DESC" };
  page?: number;
  pageSize?: number;
};

export type BuiltQuery = {
  sql: string;
  params: Record<string, unknown>;
};

const VALID_AGGREGATIONS: Set<Aggregation> = new Set(["SUM", "AVG", "COUNT", "MIN", "MAX"]);
const MAX_PAGE_SIZE = 500;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

export class QueryBuilder {
  build(request: QueryBuildRequest): BuiltQuery {
    if (!request.table || request.table.trim().length === 0) {
      throw new Error("QueryBuilder: table name is required");
    }
    if (!request.columns || request.columns.length === 0) {
      throw new Error("QueryBuilder: at least one column is required");
    }

    const params: Record<string, unknown> = {};
    const parts: string[] = [];

    const selectClause = this.buildSelectClause(request);
    parts.push(`SELECT ${selectClause}`);
    parts.push(`FROM [dbo].${this.escapeIdentifier(request.table)}`);

    const { clause, filterParams, nextIndex } = this.buildFilterClause(request.filters);
    if (clause) parts.push(`WHERE ${clause}`);
    Object.assign(params, filterParams);

    const groupByClause = this.buildGroupByClause(request);
    if (groupByClause) parts.push(`GROUP BY ${groupByClause}`);

    const orderByClause = this.buildOrderByClause(request);
    parts.push(`ORDER BY ${orderByClause}`);

    const page = Math.max(1, request.page ?? DEFAULT_PAGE);
    const pageSize = Math.min(Math.max(1, request.pageSize ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const offset = (page - 1) * pageSize;

    parts.push(`OFFSET @__offset ROWS FETCH NEXT @__limit ROWS ONLY`);
    params["__offset"] = offset;
    params["__limit"] = pageSize;

    return { sql: parts.join("\n"), params };
  }

  buildCount(request: QueryBuildRequest): BuiltQuery {
    const params: Record<string, unknown> = {};
    const parts: string[] = [];

    const hasAggregation = !!request.aggregation && request.groupBy && request.groupBy.length > 0;

    if (hasAggregation) {
      const selectClause = this.buildSelectClause(request);
      parts.push(`SELECT COUNT(*) AS totalCount FROM (SELECT ${selectClause}`);
      parts.push(`FROM [dbo].${this.escapeIdentifier(request.table)}`);

      const { clause, filterParams } = this.buildFilterClause(request.filters);
      if (clause) parts.push(`WHERE ${clause}`);
      Object.assign(params, filterParams);

      const groupByClause = this.buildGroupByClause(request);
      if (groupByClause) parts.push(`GROUP BY ${groupByClause}`);

      parts.push(`) AS __counted`);
    } else {
      parts.push(`SELECT COUNT(*) AS totalCount`);
      parts.push(`FROM [dbo].${this.escapeIdentifier(request.table)}`);

      const { clause, filterParams } = this.buildFilterClause(request.filters);
      if (clause) parts.push(`WHERE ${clause}`);
      Object.assign(params, filterParams);
    }

    return { sql: parts.join("\n"), params };
  }

  private buildSelectClause(request: QueryBuildRequest): string {
    const escapedColumns = request.columns.map((c) => this.escapeIdentifier(c));

    if (request.aggregation) {
      const agg = request.aggregation;
      if (!VALID_AGGREGATIONS.has(agg.function)) {
        throw new Error(`Invalid aggregation function: ${agg.function}`);
      }
      const aggExpr = `${agg.function}(${this.escapeIdentifier(agg.column)}) AS ${this.escapeIdentifier(`${agg.function.toLowerCase()}_${agg.column}`)}`;
      return [...escapedColumns, aggExpr].join(", ");
    }

    return escapedColumns.join(", ");
  }

  private buildFilterClause(
    filters?: Record<string, unknown>,
  ): { clause: string; filterParams: Record<string, unknown>; nextIndex: number } {
    if (!filters || Object.keys(filters).length === 0) {
      return { clause: "", filterParams: {}, nextIndex: 0 };
    }

    const conditions: string[] = [];
    const filterParams: Record<string, unknown> = {};
    let index = 0;

    for (const [column, value] of Object.entries(filters)) {
      const escapedCol = this.escapeIdentifier(column);

      if (this.isOperatorObject(value)) {
        const op = value as Record<string, unknown>;

        if ("$in" in op) {
          const arr = op.$in;
          if (!Array.isArray(arr) || arr.length === 0) {
            throw new Error(`$in operator requires a non-empty array for column "${column}"`);
          }
          const paramNames = arr.map((_, i) => {
            const pName = `filter_${index}`;
            filterParams[pName] = arr[i];
            index++;
            return `@${pName}`;
          });
          conditions.push(`${escapedCol} IN (${paramNames.join(", ")})`);
        } else if ("$between" in op) {
          const arr = op.$between;
          if (!Array.isArray(arr) || arr.length !== 2) {
            throw new Error(`$between operator requires an array of length 2 for column "${column}"`);
          }
          const pMin = `filter_${index}`;
          const pMax = `filter_${index + 1}`;
          filterParams[pMin] = arr[0];
          filterParams[pMax] = arr[1];
          index += 2;
          conditions.push(`${escapedCol} BETWEEN @${pMin} AND @${pMax}`);
        } else {
          const paramName = `filter_${index}`;
          conditions.push(`${escapedCol} = @${paramName}`);
          filterParams[paramName] = value;
          index++;
        }
      } else {
        const paramName = `filter_${index}`;
        conditions.push(`${escapedCol} = @${paramName}`);
        filterParams[paramName] = value;
        index++;
      }
    }

    return { clause: conditions.join(" AND "), filterParams, nextIndex: index };
  }

  private isOperatorObject(value: unknown): boolean {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }
    const keys = Object.keys(value);
    return keys.some((k) => k.startsWith("$"));
  }

  private buildGroupByClause(request: QueryBuildRequest): string {
    if (!request.groupBy || request.groupBy.length === 0) return "";
    return request.groupBy.map((c) => this.escapeIdentifier(c)).join(", ");
  }

  private buildOrderByClause(request: QueryBuildRequest): string {
    if (request.orderBy) {
      const dir = request.orderBy.direction === "DESC" ? "DESC" : "ASC";
      return `${this.escapeIdentifier(request.orderBy.column)} ${dir}`;
    }
    return `(SELECT NULL)`;
  }

  private escapeIdentifier(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error("Invalid identifier: name cannot be empty");
    }
    const sanitized = name.replace(/[\]]/g, "");
    if (sanitized.trim().length === 0) {
      throw new Error(`Invalid identifier: "${name}" contains only invalid characters`);
    }
    return `[${sanitized}]`;
  }
}
