import { QueryParamsConfigError, QueryParamsValidationError } from './errors';

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

export default parserValidators;
