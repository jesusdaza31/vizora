import { Request, Response, NextFunction } from "express";
import { DomainError } from "@/shared/errors/DomainError";
import { AppError, GENERIC_ERROR_DETAIL } from "@/shared/errors/AppError";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  [key: string]: unknown;
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const isDomainError = err instanceof DomainError;
  const status = isDomainError ? err.statusCode : 500;
  const detail = isDomainError ? err.message : GENERIC_ERROR_DETAIL;

  console.error("[errorHandler]", { status, name: err.name, message: err.message, context: err instanceof AppError ? err.context : undefined, path: req.originalUrl, method: req.method });
  if (err instanceof AppError && err.cause instanceof Error) console.error("[errorHandler:cause]", err.cause);
  if (err.stack) console.error(err.stack);

  const problem: ProblemDetails = {
    type: `https://api.vizora.com/errors/${err.name}`,
    title: err.name,
    status,
    detail,
    instance: req.originalUrl,
  };

  res.status(status).json(problem);
}
