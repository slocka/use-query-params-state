import { DefaultValue } from './types';

import { createQueryParamDef } from './internal/createQueryParamDef';

import serializers from './internal/serializer/serializers';
import {
  IQueryParamOptions,
  QueryParamDef,
  QueryParamValue,
  Serializer,
} from './types';

/**
 * Object used to build your query params state schema.
 * It contains a factory function for each param type.
 */
export const QPARAMS = {
  number: <QueryParamsOptions extends IQueryParamOptions>(
    defaultValue?: DefaultValue<QueryParamValue<number, QueryParamsOptions>>,
    queryParamsOptions?: QueryParamsOptions
  ) => {
    return createQueryParamDef(
      serializers.NUMBER,
      defaultValue,
      queryParamsOptions
    );
  },
  string: (
    defaultValue?: DefaultValue<string>,
    queryParamsOptions?: IQueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.STRING,
      defaultValue,
      queryParamsOptions
    );
  },
  boolean: <QueryParamsOptions extends IQueryParamOptions>(
    defaultValue?: QueryParamValue<boolean, QueryParamsOptions>,
    queryParamsOptions?: QueryParamsOptions
  ) => {
    const serializer = serializers.BOOLEAN as Serializer<
      boolean,
      QueryParamsOptions
    >;
    return createQueryParamDef(serializer, defaultValue, queryParamsOptions);
  },
  arrayOfNumbers: (
    defaultValue?: DefaultValue<number[]>,
    queryParamsOptions?: IQueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.ARRAY__NUMBERS,
      defaultValue,
      queryParamsOptions
    );
  },
  arrayOfStrings: (
    defaultValue?: DefaultValue<string[]>,
    queryParamsOptions?: IQueryParamOptions
  ) => {
    return createQueryParamDef(
      serializers.ARRAY__STRINGS,
      defaultValue,
      queryParamsOptions
    );
  },
};
