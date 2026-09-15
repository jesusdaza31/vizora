import { DomainError } from "@/shared/errors/DomainError";

export class VizoraTableNotFoundError extends DomainError {
  constructor(table: string) {
    super(`Table "${table}" not found or not accessible`, 404);
  }
}

export class VizoraDashboardNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Dashboard with id "${id}" not found`, 404);
  }
}

export class VizoraValidationError extends DomainError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class VizoraConcurrencyConflictError extends DomainError {
  constructor(id: string, expectedVersion: number, actualVersion: number) {
    super(`Dashboard "${id}" was modified. Expected version ${expectedVersion}, found ${actualVersion}`, 409);
  }
}

export class VizoraQueryTimeoutError extends DomainError {
  constructor() {
    super("Query execution exceeded 30s timeout. Try adding filters to reduce the result set.", 408);
  }
}

export class VizoraInvalidThemeTokenError extends DomainError {
  constructor(message: string) {
    super(message, 400);
  }
}

export type VizoraDomainError =
  | VizoraTableNotFoundError
  | VizoraDashboardNotFoundError
  | VizoraValidationError
  | VizoraConcurrencyConflictError
  | VizoraQueryTimeoutError
  | VizoraInvalidThemeTokenError;
