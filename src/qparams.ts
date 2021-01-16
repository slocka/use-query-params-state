import { DefaultValue } from './types';
// import { QueryParamDef } from './internal/queryParamDef';

import { createQueryParamDef } from './internal/createQueryParamDef';

import serializers from './internal/serializer/serializers';
import { QueryParamOptions } from './types';

/**
 * Object used to build your query params state schema.
 * It contains a factory function for each param type.
 */
export const QPARAMS = {
  number: (
    defaultValue?: DefaultValue<number>,
    queryParamsOptions?: QueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.NUMBER,
      defaultValue,
      queryParamsOptions
    );
  },
  string: (
    defaultValue?: DefaultValue<string>,
    queryParamsOptions?: QueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.STRING,
      defaultValue,
      queryParamsOptions
    );
  },
  boolean: (
    defaultValue?: DefaultValue<boolean>,
    queryParamsOptions?: QueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.BOOLEAN,
      defaultValue,
      queryParamsOptions
    );
  },
  arrayOfNumbers: (
    defaultValue?: DefaultValue<number[]>,
    queryParamsOptions?: QueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.ARRAY__NUMBERS,
      defaultValue,
      queryParamsOptions
    );
  },
  arrayOfStrings: (
    defaultValue?: DefaultValue<string[]>,
    queryParamsOptions?: QueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.ARRAY__STRINGS,
      defaultValue,
      queryParamsOptions
    );
  },
};
