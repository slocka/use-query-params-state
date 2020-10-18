import { QueryParamsConfigError, QueryParamsValidationError } from './errors';
import { QueryParamsSchema } from './types';

/**
 * For each query param where a validator function was provided, run the validator function.
 * If the validation fails, the provided default value will be used.
 * @param config
 * @param parsedQueryParams
 */
export function runParamsValidators(
  queryParamsSchema: QueryParamsSchema,
  parsedQueryParams: Record<string, any>,
  contextData?: any,
  throwOnError: boolean = false
): Record<string, any> {
  return Object.keys(queryParamsSchema).reduce((acc, queryParamKey) => {
    const queryParamDef = queryParamsSchema[queryParamKey];
    const paramValue = parsedQueryParams[queryParamKey];
    try {
      queryParamDef.runValidator(paramValue, parsedQueryParams, contextData);
    } catch (err) {
      // Rethrow the error
      if (throwOnError) {
        throw err;
      }
      // The parsed value is incorrect, use the default value instead.
      acc[queryParamKey] = queryParamDef.getDefaultValue(contextData);
    }

    return acc;
  }, parsedQueryParams);
}

export const paramValidators = {
  oneOf: (possibleValues: Array<any>) => {
    if (!possibleValues || !Array.isArray(possibleValues)) {
      throw new QueryParamsConfigError(
        "Validator 'oneOf()' takes an array as first argument."
      );
    }

    return (paramValue: any) => {
      if (possibleValues.indexOf(paramValue) === -1) {
        throw new QueryParamsValidationError(
          `Invalid value '${paramValue}'. Accepted values are: ${possibleValues.join(
            ','
          )}.`
        );
      }

      return paramValue;
    };
  },
};

export default paramValidators;
