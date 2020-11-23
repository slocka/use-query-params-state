import { isUndefined, isFunction } from './typeChecking';

import {
  Serializer,
  SerializerToUrlFunction,
  DefaultValue,
  DefaultValueFunction,
  ValidatorFunction,
} from '../types';

export class QueryParamDef<T> {
  private defaultValue?: DefaultValue<T>;
  private validatorFn?: ValidatorFunction<T>;
  private serializer: Serializer<T>;

  constructor(serializer: Serializer<T>, defaultValue?: DefaultValue<T>) {
    this.serializer = serializer;
    this.defaultValue = defaultValue;
  }

  /**
   * defaultValue value can be a static value or a function
   * calculating the default value
   */
  private isDefaultValueFunction(
    defaultValue: DefaultValue<T>
  ): defaultValue is DefaultValueFunction<T> {
    return isFunction(defaultValue);
  }

  /**
   * Get the default static value or run defaultValue function to get it.
   * @param contextData
   */
  public getDefaultValue = (contextData?: any): T | null | undefined => {
    if (this.isDefaultValueFunction(this.defaultValue)) {
      return this.defaultValue(contextData);
    }

    return this.defaultValue;
  };

  /**
   * Set Validator
   */
  public validator = (validatorFn: ValidatorFunction<T>) => {
    this.validatorFn = validatorFn;
    return this;
  };

  /**
   * Deserialize the query params from string to the defined query param type.
   */
  public fromURL = (
    value?: string | null,
    contextData?: any
  ): T | null | undefined => {
    const parsedValue = this.serializer.fromUrl(value);

    // Value not found in the URL
    if (isUndefined(parsedValue)) {
      return this.getDefaultValue(contextData);
    }

    return parsedValue;
  };

  /**
   * Serialized the query param from the defined query param type to string
   */
  public toURL: SerializerToUrlFunction<T> = value => {
    return this.serializer.toUrl(value);
  };

  public runValidator = (
    value: T,
    parsedQueryParams: object,
    contextData?: any
  ): void => {
    if (this.validatorFn) {
      this.validatorFn(value, parsedQueryParams, contextData);
    }
  };
}
