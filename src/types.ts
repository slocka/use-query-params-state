import { QueryParamDef } from './internal/queryParamDef';

// Cool trick
type _<T> = T;
type FlattenTypes<T> = _<{ [k in keyof T]: T[k] }>;

/**
 * Interface any query-params-state schema needs to extend.
 */
export type IQueryParamsStateSchema = Record<
  string,
  QueryParamDef<any, QueryParamOptions>
>;

/**
 * The Javascript state representing the content of the URL query string based on the associated
 * query-params-state schema.
 */
export type QueryParamsState<S extends IQueryParamsStateSchema> = {
  [K in keyof S]: S[K] extends QueryParamDef<infer T, infer Options>
    ? QueryParamValue<T, Options>
    : never;
};

export type SetQueryParamsState<T extends IQueryParamsStateSchema> = (
  newQueryParams: Partial<QueryParamsState<T>>,
  fromCurrent?: boolean
) => void;

/**
 * Javascript object representing the "raw" (not decoded) content of the URL,
 * without validation nor type transformation.
 */

// export type RawQueryParams<S extends IQueryParamsStateSchema> = {
//   [K in keyof S]: S[K] extends QueryParamDef<infer T, infer Options>
//     ? QueryParamValue<string, Options>
//     : never;
// };

export type RawQueryParams<S extends IQueryParamsStateSchema> = {
  [K in keyof S]: ReturnType<S[K]['toURL']>;
};

/**
 * Enum of build strategies determining how a newly build query string should preserve
 * parameters from the current query string.
 */
export enum QS_BUILD_STRATEGY {
  /**
   * Create a new query string from new params and preserve all pre-existing params.
   */
  PRESERVE_ALL,
  /**
   * Create a new query string from new params and only preserve pre-existing params that are not
   * outside the schema.
   */
  PRESERVE_EXTERNAL_ONLY,
  /**
   * Create a new query string from new params, preserve all pre-existing params, and add params defined in schema
   * but are missing from the query string. (For those, the param value will be the default value).
   */
  PRESERVE_ALL_WITH_DEFAULT,
  /**
   * Create a new query string from new params only.
   */
  PRESERVE_NONE,
}

export type BuildQueryStringFromCurrentUrl<
  T extends IQueryParamsStateSchema
> = (
  newQueryParams?: Partial<QueryParamsState<T>>,
  buildStrategy?: QS_BUILD_STRATEGY,
  contextData?: any
) => string;

export type DefaultValueFunction<T> = (context?: any) => T;
export type DefaultValue<T> = T | DefaultValueFunction<T>;

export type ValidatorFunction<T, Options> = (
  value: QueryParamValue<T, Options>,
  queryParams: object,
  contextData: any
) => void;

export type SerializerToUrlFunction<T, Options> = (
  param: QueryParamValue<T, Options>
) => QueryParamValue<string, Options>;

export type SerializerFromUrlFunction<T, Options> = (
  param: QueryParamValue<string, Options>
) => QueryParamValue<T, Options>;

export type Serializer<T, Options> = {
  toUrl: SerializerToUrlFunction<T, Options>;
  fromUrl: SerializerFromUrlFunction<T, Options>;
};

export type QueryParamOptions = Partial<{
  allowNull: boolean;
  allowUndefined: boolean;
  // validator:
}>;

// export type QueryParamsValueType<T, Options> = Options extends {
//   allowNull: true;
//   allowUndefined: true;
// }
//   ? T | null | undefined
//   : Options extends {
//       allowNull: false;
//       allowUndefined: true;
//     }
//   ? T | undefined
//   : Options extends {
//       allowNull: true;
//       allowUndefined: false;
//     }
//   ? T | null
//   : Options extends {
//       allowNull: false;
//       allowUndefined: false;
//     }
//   ? T
//   : never;

export type QueryParamValue<
  T,
  Options extends QueryParamOptions
> = ResolveUndefinedType<ResolveNullType<T, Options>, Options>;

export type ResolveNullType<
  T,
  Options extends QueryParamOptions
> = Options extends {
  allowNull: true;
}
  ? T | null
  : T;

export type ResolveUndefinedType<
  T,
  Options extends QueryParamOptions
> = Options extends {
  allowUndefined: true;
}
  ? T | undefined
  : T;

// type TEST = QueryParamValue<string, { allowUndefined: true; allowNull: true }>;
