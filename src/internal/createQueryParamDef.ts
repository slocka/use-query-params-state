import { isUndefined, isFunction } from './typeChecking';

import {
  Serializer,
  DefaultValue,
  DefaultValueFunction,
  IQueryParamTypeOptions,
  QueryParamValue,
  QueryParamOptions,
} from '../types';

export function createQueryParamDef<
  T,
  QueryParamTypeOptions extends Partial<IQueryParamTypeOptions>
>(
  serializer: Serializer<T, QueryParamTypeOptions>,
  defaultValue?: DefaultValue<QueryParamValue<T, QueryParamTypeOptions>>,
  options?: QueryParamOptions<T, QueryParamTypeOptions>
) {
  let validatorFn = options?.validator;

  /**
   * defaultValue value can be a static value or a function
   * calculating the default value
   */
  function isDefaultValueFunction(
    defaultValue:
      | DefaultValue<QueryParamValue<T, QueryParamTypeOptions>>
      | undefined
  ): defaultValue is DefaultValueFunction<
    QueryParamValue<T, QueryParamTypeOptions>
  > {
    return isFunction(defaultValue);
  }

  /**
   * Get the default static value or run defaultValue function to get it.
   * @param contextData
   */
  function getDefaultValue(
    contextData?: any
  ): QueryParamValue<T, QueryParamTypeOptions> | undefined {
    if (isDefaultValueFunction(defaultValue)) {
      return defaultValue(contextData);
    }

    return defaultValue;
  }

  // /**
  //  * Set Validator
  //  */
  // function validator(newValidatorFn: ValidatorFunction<T, QueryParamTypeOptions>) {
  //   validatorFn = newValidatorFn;

  //   return queryParamDef;
  // }

  /**
   * Deserialize the query params from string to the defined query param type.
   */
  function fromURL(
    value: QueryParamValue<string, QueryParamTypeOptions>,
    contextData?: any
  ): QueryParamValue<T, QueryParamTypeOptions> {
    const parsedValue = serializer.fromUrl(value);

    // Value not found in the URL
    if (isUndefined(parsedValue)) {
      const defaultValue = getDefaultValue(contextData);
      if (isUndefined(defaultValue)) {
        if (options?.allowUndefined) {
          return undefined as QueryParamValue<T, QueryParamTypeOptions>;
        } else {
          throw new Error('Missing default value');
        }
      }
      return defaultValue;
    }
    return parsedValue;
  }

  /**
   * Serialized the query param from the defined query param type to string
   */
  function toURL(
    value: QueryParamValue<T, QueryParamTypeOptions>
  ): QueryParamValue<string, QueryParamTypeOptions> {
    return serializer.toUrl(value);
  }

  function runValidator(
    value: QueryParamValue<T, QueryParamTypeOptions>,
    parsedQueryParams: object,
    contextData?: any
  ): void {
    if (validatorFn) {
      validatorFn(value, parsedQueryParams, contextData);
    }
  }

  const queryParamDef = {
    fromURL,
    toURL,
    runValidator,
    getDefaultValue,
  };

  return queryParamDef;
}
