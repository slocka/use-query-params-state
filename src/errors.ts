export class QueryParamsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryParamsValidationError';
  }
}

export class QueryParamsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryParamsConfigError';
  }
}

export class QueryParamsUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryParamsUpdateError';
  }
}
