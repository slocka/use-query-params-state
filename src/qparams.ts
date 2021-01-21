import { DefaultValue } from './types';

import { createQueryParamDef } from './internal/createQueryParamDef';

import serializers from './internal/serializer/serializers';
import {
  IQueryParamTypeOptions,
  QueryParamOptions,
  QueryParamValue,
  Serializer,
} from './types';

/**
 * Object used to build your query params state schema.
 * It contains a factory function for each param type.
 */
export const QPARAMS = {
  number: <QueryParamTypeOptions extends IQueryParamTypeOptions>(
    defaultValue: DefaultValue<QueryParamValue<number, QueryParamTypeOptions>>,
    queryParamsOptions?: QueryParamOptions<number, QueryParamTypeOptions>
  ) => {
    const serializer = serializers.NUMBER as Serializer<
      number,
      QueryParamTypeOptions
    >;

    return createQueryParamDef(serializer, defaultValue, queryParamsOptions);
  },
  string: <QueryParamTypeOptions extends IQueryParamTypeOptions>(
    defaultValue: DefaultValue<QueryParamValue<string, QueryParamTypeOptions>>,
    queryParamsOptions?: QueryParamOptions<string, QueryParamTypeOptions>
  ) => {
    const serializer = serializers.STRING as Serializer<
      string,
      QueryParamTypeOptions
    >;

    return createQueryParamDef(serializer, defaultValue, queryParamsOptions);
  },
  boolean: <QueryParamTypeOptions extends IQueryParamTypeOptions>(
    defaultValue: DefaultValue<QueryParamValue<boolean, QueryParamTypeOptions>>,
    queryParamsOptions?: QueryParamOptions<boolean, QueryParamTypeOptions>
  ) => {
    const serializer = serializers.BOOLEAN as Serializer<
      boolean,
      QueryParamTypeOptions
    >;

    return createQueryParamDef(serializer, defaultValue, queryParamsOptions);
  },
  arrayOfNumbers: <QueryParamTypeOptions extends IQueryParamTypeOptions>(
    defaultValue: DefaultValue<
      QueryParamValue<number[], QueryParamTypeOptions>
    >,
    queryParamsOptions?: QueryParamOptions<number[], QueryParamTypeOptions>
  ) => {
    const serializer = serializers.ARRAY__NUMBERS as Serializer<
      number[],
      QueryParamTypeOptions
    >;

    return createQueryParamDef(serializer, defaultValue, queryParamsOptions);
  },
  arrayOfStrings: <QueryParamTypeOptions extends IQueryParamTypeOptions>(
    defaultValue: DefaultValue<
      QueryParamValue<string[], QueryParamTypeOptions>
    >,
    queryParamsOptions?: QueryParamOptions<string[], QueryParamTypeOptions>
  ) => {
    const serializer = serializers.ARRAY__STRINGS as Serializer<
      string[],
      QueryParamTypeOptions
    >;

    return createQueryParamDef(serializer, defaultValue, queryParamsOptions);
  },
};
