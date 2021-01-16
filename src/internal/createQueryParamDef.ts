import { isUndefined, isFunction } from './typeChecking';

import {
  Serializer,
  QueryParamDef,
  DefaultValue,
  DefaultValueFunction,
  ValidatorFunction,
  QueryParamOptions,
  QueryParamValue,
  FlattenTypes,
} from '../types';

export function createQueryParamDef<
  T,
  MyQueryParamsOptions extends QueryParamOptions
>(
  serializer: Serializer<T, MyQueryParamsOptions>,
  defaultValue?: DefaultValue<QueryParamValue<T, MyQueryParamsOptions>>,
  options?: MyQueryParamsOptions
): FlattenTypes<QueryParamDef<T, MyQueryParamsOptions>> {
  let validatorFn: ValidatorFunction<T, MyQueryParamsOptions>;

  /**
   * defaultValue value can be a static value or a function
   * calculating the default value
   */
  function isDefaultValueFunction(
    defaultValue:
      | DefaultValue<QueryParamValue<T, MyQueryParamsOptions>>
      | undefined
  ): defaultValue is DefaultValueFunction<
    QueryParamValue<T, MyQueryParamsOptions>
  > {
    return isFunction(defaultValue);
  }

  /**
   * Get the default static value or run defaultValue function to get it.
   * @param contextData
   */
  function getDefaultValue(
    contextData?: any
  ): QueryParamValue<T, MyQueryParamsOptions> | undefined {
    if (isDefaultValueFunction(defaultValue)) {
      return defaultValue(contextData);
    }

    return defaultValue;
  }

  /**
   * Set Validator
   */
  function validator(
    newValidatorFn: ValidatorFunction<T, MyQueryParamsOptions>
  ) {
    validatorFn = newValidatorFn;

    return queryParamDef;
  }

  /**
   * Deserialize the query params from string to the defined query param type.
   */
  function fromURL(
    value: QueryParamValue<string, MyQueryParamsOptions>,
    contextData?: any
  ): QueryParamValue<T, MyQueryParamsOptions> {
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
    value: QueryParamValue<T, MyQueryParamsOptions>
  ): QueryParamValue<string, MyQueryParamsOptions> {
    return serializer.toUrl(value);
  }

  function runValidator(
    value: QueryParamValue<T, MyQueryParamsOptions>,
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
