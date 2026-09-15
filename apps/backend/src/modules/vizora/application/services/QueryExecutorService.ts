import { injectable } from "tsyringe";
import { ResultAsync, okAsync, errAsync } from "neverthrow";
import { getPool, queryRaw } from "@vizora/database";
import { DbError } from "@/shared/errors/AppError";
import { QueryBuilder } from "../../infrastructure/QueryBuilder";
import { VizoraQueryTimeoutError } from "../../domain/errors";
import type { IQueryExecutorService } from "../contracts/IQueryExecutorService";
import type { QueryRequestDTO } from "../dtos/QueryRequestDTO";
import type { QueryResult } from "../../domain/entities";
import type { VizoraDomainError } from "../../domain/errors";

const QUERY_TIMEOUT_MS = 30_000;

@injectable()
export class QueryExecutorService implements IQueryExecutorService {
  private readonly queryBuilder = new QueryBuilder();

  execute(request: QueryRequestDTO): ResultAsync<QueryResult, DbError | VizoraDomainError> {
    return ResultAsync.fromPromise(this.runQuery(request), (e) => this.mapError(e));
  }

  private async runQuery(request: QueryRequestDTO): Promise<QueryResult> {
    const pool = await getPool();

    const dataQuery = this.queryBuilder.build(request);
    const countQuery = this.queryBuilder.buildCount(request);

    const page = Math.max(1, request.page ?? 1);
    const pageSize = Math.min(Math.max(1, request.pageSize ?? 50), 500);

    const dataRequest = pool.request();
    for (const [key, value] of Object.entries(dataQuery.params)) {
      dataRequest.input(key, value);
    }
    dataRequest.timeout = QUERY_TIMEOUT_MS;

    const countRequest = pool.request();
    for (const [key, value] of Object.entries(countQuery.params)) {
      countRequest.input(key, value);
    }
    countRequest.timeout = QUERY_TIMEOUT_MS;

    const [dataResult, countResult] = await Promise.all([
      dataRequest.query(dataQuery.sql),
      countRequest.query(countQuery.sql),
    ]);

    const totalCount =
      countResult.recordset.length > 0 ? Number(countResult.recordset[0].totalCount) : 0;

    return {
      data: dataResult.recordset as Record<string, unknown>[],
      totalCount,
      page,
      pageSize,
    };
  }

  private mapError(e: unknown): DbError | VizoraDomainError {
    if (e instanceof Error && e.message.includes("Timeout")) {
      return new VizoraQueryTimeoutError();
    }
    if (e instanceof Error && (e as any).code === "ETIMEOUT") {
      return new VizoraQueryTimeoutError();
    }
    return new DbError(e);
  }
}
