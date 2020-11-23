import { Errors } from './errors';
import { IQueryParamsSchema, QueryParams } from './types';

/**
 * For each query param where a validator function was provided, run the validator function.
 * If the validation fails, the provided default value will be used.
 */
export function runParamsValidators<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema,
  queryParams: QueryParams<QueryParamsSchema>,
  contextData?: any,
  throwOnError: boolean = false
): QueryParams<QueryParamsSchema> {
  return Object.keys(queryParamsSchema).reduce(
    (acc, queryParamKey: keyof QueryParamsSchema) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      const paramValue = queryParams[queryParamKey];
      try {
        queryParamDef.runValidator(paramValue, queryParams, contextData);
      } catch (err) {
        // Rethrow the error
        if (throwOnError) {
          throw err;
        }
        // The parsed value is incorrect, use the default value instead.
        acc[queryParamKey] = queryParamDef.getDefaultValue(contextData);
      }

      return acc;
    },
    queryParams
  );
}

export function runParamsValidatorsPartial<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema,
  queryParams: Partial<QueryParams<QueryParamsSchema>>,
  contextData?: any,
  throwOnError: boolean = false
): Partial<QueryParams<QueryParamsSchema>> {
  return Object.keys(queryParams).reduce(
    (
      acc: Partial<QueryParams<QueryParamsSchema>>,
      queryParamKey: keyof QueryParamsSchema
    ) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      if (!queryParamDef) {
        // We could raise an error here, but we will ignore it and let
        // the error be raised by serializeQueryParamsValues instead.
        return acc;
      }
      const paramValue = queryParams[queryParamKey];
      try {
        queryParamDef.runValidator(paramValue, queryParams, contextData);
      } catch (err) {
        // Rethrow the error
        if (throwOnError) {
          throw err;
        }
        // The parsed value is incorrect, use the default value instead.
        acc[queryParamKey] = queryParamDef.getDefaultValue(contextData);
      }

      return acc;
    },
    {}
  );
}

function oneOfValidator<T>(possibleValues: Array<T>) {
  if (!possibleValues || !Array.isArray(possibleValues)) {
    throw new Errors.QueryParamsConfigError(
      "Validator 'oneOf()' takes an array as first argument."
    );
  }

  return (paramValue: any): T => {
    if (possibleValues.indexOf(paramValue) === -1) {
      throw new Errors.QueryParamsValidationError(
        `Invalid value '${paramValue}'. Accepted values are: ${possibleValues.join(
          ','
        )}.`
      );
    }

    return paramValue;
  };
}

export const VALIDATORS = {
  /**
   * Returns a validator function that checks if the paramValue is shallow equal to one of the provided `possibleValues`.
   */
  oneOf: oneOfValidator,
};
