import { DomainError } from "@/shared/errors/DomainError";
import { InternalServerError } from "@/shared/errors/AppError";

export function toHttpError(err: unknown): DomainError {
  if (err instanceof DomainError) return err;
  return new InternalServerError(err, { layer: "presentation" });
}
