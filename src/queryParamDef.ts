import { isUndefined, isFunction } from './lib';

import {
  Serializer,
  SerializerFromUrlFunction,
  SerializerToUrlFunction,
  DefaultValue,
  DefaultValueFunction,
  ValidatorFunction,
} from './types';

export class QueryParamDef<T> {
  private defaultValue?: DefaultValue<T>;
  private validatorFn?: ValidatorFunction<T>;
  private serializer: Serializer<T>;

  constructor(serializer: Serializer<T>, defaultValue?: DefaultValue<T>) {
    this.serializer = serializer;
    this.defaultValue = defaultValue;
  }

  private isDefaultValueFunction(
    defaultValue: DefaultValue<T>
  ): defaultValue is DefaultValueFunction<T> {
    return isFunction(defaultValue);
  }

  /**
   * TODO: For the moment, there is no much point of using a default value as a function
   * as we are not passing any runtime props yet.
   * This can still be useful if we want to get the default based on the latest
   * value in local storage for example.
   */
  public getDefaultValue = (): T | undefined => {
    if (this.isDefaultValueFunction(this.defaultValue)) {
      return this.defaultValue();
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
   * @internal
   */
  public fromURL: SerializerFromUrlFunction<T> = value => {
    const parsedValue = this.serializer.fromUrl(value);

    // Value not found in the URL
    if (isUndefined(parsedValue) || parsedValue === null) {
      return this.getDefaultValue();
    }

    return parsedValue;
  };

  /**
   * Serialized the query param from the defined query param type to string
   * @internal
   */
  public toURL: SerializerToUrlFunction<T> = value => {
    return this.serializer.toUrl(value);
  };

  public runValidator = (value: T, parsedQueryParams: object): void => {
    if (this.validatorFn) {
      this.validatorFn(value, parsedQueryParams);
    }
  };
}
