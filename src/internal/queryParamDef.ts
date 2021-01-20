import { isUndefined, isFunction } from './typeChecking';

import {
  Serializer,
  SerializerToUrlFunction,
  DefaultValue,
  DefaultValueFunction,
  ValidatorFunction,
  IQueryParamTypeOptions,
  QueryParamValue,
} from '../types';

export class QueryParamDef<
  T,
  MyQueryParamsOptions extends IQueryParamTypeOptions
> {
  private defaultValue?: DefaultValue<QueryParamValue<T, MyQueryParamsOptions>>;
  private validatorFn?: ValidatorFunction<T, MyQueryParamsOptions>;
  private serializer: Serializer<T, MyQueryParamsOptions>;
  private options: MyQueryParamsOptions;

  constructor(
    serializer: Serializer<T, MyQueryParamsOptions>,
    defaultValue?: DefaultValue<QueryParamValue<T, MyQueryParamsOptions>>,
    options?: MyQueryParamsOptions
  ) {
    this.options = options || ({} as MyQueryParamsOptions);
    this.serializer = serializer;
    this.defaultValue = defaultValue;
  }

  /**
   * defaultValue value can be a static value or a function
   * calculating the default value
   */
  private isDefaultValueFunction(
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
  public getDefaultValue = (
    contextData?: any
  ): QueryParamValue<T, MyQueryParamsOptions> | undefined => {
    if (this.isDefaultValueFunction(this.defaultValue)) {
      return this.defaultValue(contextData);
    }

    return this.defaultValue;
  };

  /**
   * Set Validator
   */
  public validator = (
    validatorFn: ValidatorFunction<T, MyQueryParamsOptions>
  ) => {
    this.validatorFn = validatorFn;
    return this;
  };

  /**
   * Deserialize the query params from string to the defined query param type.
   */
  public fromURL = (
    value: QueryParamValue<string, MyQueryParamsOptions>,
    contextData?: any
  ): QueryParamValue<T, MyQueryParamsOptions> => {
    const parsedValue = this.serializer.fromUrl(value);

    // Value not found in the URL
    if (isUndefined(parsedValue)) {
      const defaultValue = this.getDefaultValue(contextData);
      // TODO: Check for allowNull, allowUndefined option
      if (!defaultValue) {
        throw new Error('Missing default value');
      }

      return defaultValue;
    }

    return parsedValue;
  };

  /**
   * Serialized the query param from the defined query param type to string
   */
  public toURL = (
    value: QueryParamValue<T, MyQueryParamsOptions>
  ): QueryParamValue<string, MyQueryParamsOptions> => {
    return this.serializer.toUrl(value);
  };

  public runValidator = (
    value: QueryParamValue<T, MyQueryParamsOptions>,
    parsedQueryParams: object,
    contextData?: any
  ): void => {
    if (this.validatorFn) {
      this.validatorFn(value, parsedQueryParams, contextData);
    }
  };
}
