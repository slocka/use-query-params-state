import { isUndefined, isFunction } from './lib';
import serializers from './serializer/serializers';

import {
  Serializer,
  SerializerFromUrlFunction,
  SerializerToUrlFunction,
  DefaultValue,
  DefaultValueFunction,
  ValidatorFunction,
  Scalar,
  GetTsTypeFromScalar,
  ScalarTypeToSerializerMap,
} from './types';

export class QueryParamDef<S extends Scalar, TsType = GetTsTypeFromScalar<S>> {
  private defaultValue?: DefaultValue<TsType>;
  private validatorFn?: ValidatorFunction<TsType>;
  private serializer: ScalarTypeToSerializerMap[S];
  private type: S;

  constructor(scalarType: S, defaultValue?: DefaultValue<TsType>) {
    this.type = scalarType;
    this.serializer = serializers[scalarType];
    this.defaultValue = defaultValue;
  }

  /**
   * defaultValue value can be a static value or a function
   * calculating the default value
   */
  private isDefaultValueFunction(
    defaultValue: DefaultValue<TsType>
  ): defaultValue is DefaultValueFunction<TsType> {
    return isFunction(defaultValue);
  }

  /**
   * Get the default static value or run defaultValue function to get it.
   * @param contextData
   */
  public getDefaultValue = (contextData?: any): TsType | undefined => {
    if (this.isDefaultValueFunction(this.defaultValue)) {
      return this.defaultValue(contextData);
    }

    return this.defaultValue;
  };

  /**
   * Set Validator
   */
  public validator = (validatorFn: ValidatorFunction<TsType>) => {
    this.validatorFn = validatorFn;
    return this;
  };

  /**
   * Deserialize the query params from string to the defined query param type.
   */
  public fromURL = (
    value?: string | null,
    contextData?: any
  ): GetTsTypeFromScalar<S> => {
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
  public toURL: SerializerToUrlFunction<TsType> = value => {
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

  public getType = (): T => {
    return this.type;
  };
}
