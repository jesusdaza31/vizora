import { DomainError } from "./DomainError";

export const GENERIC_ERROR_DETAIL = "Internal server error";

export abstract class AppError extends DomainError {
  constructor(
    message: string,
    statusCode = 500,
    public readonly cause?: unknown,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message, statusCode);
  }
}

export class DbError extends AppError {
  constructor(cause: unknown, context?: Record<string, unknown>) {
    super(GENERIC_ERROR_DETAIL, 500, cause, context);
  }
}

export class InternalServerError extends AppError {
  constructor(cause: unknown, context?: Record<string, unknown>) {
    super(GENERIC_ERROR_DETAIL, 500, cause, context);
  }
}
