import { QueryParamsConfigError, QueryParamsValidationError } from './errors';
import { TypedQueryParamsConfig, KeyObject } from './types';

const parserValidators = {
  oneOf: (possibleValues: Array<any>) => {
    if (!possibleValues || !Array.isArray(possibleValues)) {
      throw new QueryParamsValidationError(
        "Validator 'oneOf()' takes an array as first argument."
      );
    }

    return (paramValue: any) => {
      if (possibleValues.indexOf(paramValue) === -1) {
        throw new QueryParamsConfigError(
          `Invalid value '${paramValue}'. Accepted values are: ${possibleValues.join(
            ','
          )}.`
        );
      }

      return paramValue;
    };
  },
};

/**
 * For each query param where a validator function was provided, run the validator function.
 * If the validation fails, the provided default value will be used.
 * @param config
 * @param parsedQueryParams
 */
export function runParamsValidators(
  config: TypedQueryParamsConfig,
  parsedQueryParams: KeyObject
): KeyObject {
  return Object.keys(config).reduce((acc, propKey) => {
    const { validator, defaultValue } = config[propKey];
    if (validator) {
      const paramValue = parsedQueryParams[propKey];
      try {
        validator(paramValue, parsedQueryParams);
      } catch (err) {
        // The parsed value is incorrect, use the default value instead.
        acc[propKey] = defaultValue;
      }
    }

    return acc;
  }, parsedQueryParams);
}

export default parserValidators;
