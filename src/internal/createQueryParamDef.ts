import { isUndefined, isFunction } from './typeChecking';

import {
  Serializer,
  DefaultValue,
  DefaultValueFunction,
  ValidatorFunction,
  IQueryParamOptions,
  QueryParamValue,
  FlattenTypes,
} from '../types';

export function createQueryParamDef<
  T,
  QueryParamOptions extends Partial<IQueryParamOptions>
>(
  serializer: Serializer<T, QueryParamOptions>,
  defaultValue?: DefaultValue<QueryParamValue<T, QueryParamOptions>>,
  options?: QueryParamOptions
) {
  let validatorFn: ValidatorFunction<T, QueryParamOptions>;

  /**
   * defaultValue value can be a static value or a function
   * calculating the default value
   */
  function isDefaultValueFunction(
    defaultValue:
      | DefaultValue<QueryParamValue<T, QueryParamOptions>>
      | undefined
  ): defaultValue is DefaultValueFunction<
    QueryParamValue<T, QueryParamOptions>
  > {
    return isFunction(defaultValue);
  }

  /**
   * Get the default static value or run defaultValue function to get it.
   * @param contextData
   */
  function getDefaultValue(
    contextData?: any
  ): QueryParamValue<T, QueryParamOptions> | undefined {
    if (isDefaultValueFunction(defaultValue)) {
      return defaultValue(contextData);
    }

    return defaultValue;
  }

  /**
   * Set Validator
   */
  function validator(newValidatorFn: ValidatorFunction<T, QueryParamOptions>) {
    validatorFn = newValidatorFn;

    return queryParamDef;
  }

  /**
   * Deserialize the query params from string to the defined query param type.
   */
  function fromURL(
    value: QueryParamValue<string, QueryParamOptions>,
    contextData?: any
  ): QueryParamValue<T, QueryParamOptions> {
    const parsedValue = serializer.fromUrl(value);
    // Value not found in the URL
    if (isUndefined(parsedValue)) {
      const defaultValue = getDefaultValue(contextData);
      // TODO: Check for allowNull, allowUndefined option
      if (!defaultValue) {
        throw new Error('Missing default value');
      }
      return defaultValue;
    }
    return parsedValue;
  }

  /**
   * Serialized the query param from the defined query param type to string
   */
  function toURL(
    value: QueryParamValue<T, QueryParamOptions>
  ): QueryParamValue<string, QueryParamOptions> {
    return serializer.toUrl(value);
  }

  function runValidator(
    value: QueryParamValue<T, QueryParamOptions>,
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
    validator,
  };

  return queryParamDef;
}
