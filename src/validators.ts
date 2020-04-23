import { QueryParamsConfigError, QueryParamsValidationError } from './errors';
import { TypedQueryParamsConfig, KeyObject } from './types';

/**
 * For each query param where a validator function was provided, run the validator function.
 * If the validation fails, the provided default value will be used.
 * @param config
 * @param parsedQueryParams
 */
export function runParamsValidators(
  config: TypedQueryParamsConfig,
  parsedQueryParams: KeyObject,
  throwOnError: boolean = false
): KeyObject {
  return Object.keys(config).reduce((acc, propKey) => {
    const { validator, defaultValue } = config[propKey];
    if (validator) {
      const paramValue = parsedQueryParams[propKey];
      try {
        validator(paramValue, parsedQueryParams);
      } catch (err) {
        // Rethrow the error
        if (throwOnError) {
          throw err;
        }
        // The parsed value is incorrect, use the default value instead.
        acc[propKey] = defaultValue;
      }
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
