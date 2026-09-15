export abstract class DomainError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    const detail = id ? `${entity} with id ${id} not found` : `${entity} not found`;
    super(detail, 404);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) { super(message, 400); }
}

export class ConflictError extends DomainError {
  constructor(message: string) { super(message, 409); }
}
