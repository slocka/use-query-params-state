class QueryParamsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryParamsValidationError';
  }
}

class QueryParamsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryParamsConfigError';
  }
}

class QueryParamsUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryParamsUpdateError';
  }
}

export const Errors = {
  QueryParamsValidationError,
  QueryParamsConfigError,
  QueryParamsUpdateError,
};
