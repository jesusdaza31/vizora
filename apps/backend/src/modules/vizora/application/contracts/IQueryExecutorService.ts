import type { ResultAsync } from "neverthrow";
import type { QueryResult } from "../../domain/entities";
import type { VizoraDomainError } from "../../domain/errors";
import type { DbError } from "@/shared/errors/AppError";
import type { QueryRequestDTO } from "../dtos/QueryRequestDTO";

export interface IQueryExecutorService {
  execute(request: QueryRequestDTO): ResultAsync<QueryResult, DbError | VizoraDomainError>;
}
