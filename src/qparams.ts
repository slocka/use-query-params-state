import { DefaultValue } from './types';
// import { QueryParamDef } from './internal/queryParamDef';

import { createQueryParamDef } from './internal/createQueryParamDef';

import serializers from './internal/serializer/serializers';
import {
  QueryParamOptions,
  QueryParamDef,
  QueryParamValue,
  FlattenTypes,
} from './types';

/**
 * Object used to build your query params state schema.
 * It contains a factory function for each param type.
 */
export const QPARAMS = {
  number: <MyQueryParamsOptions extends QueryParamOptions>(
    defaultValue?: DefaultValue<QueryParamValue<number, MyQueryParamsOptions>>,
    queryParamsOptions?: MyQueryParamsOptions
  ): QueryParamDef<number, MyQueryParamsOptions> => {
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
  boolean: <MyQueryParamsOptions extends QueryParamOptions>(
    defaultValue?: QueryParamValue<boolean, MyQueryParamsOptions>,
    queryParamsOptions?: MyQueryParamsOptions
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
