import { QueryParamDef } from './internal/queryParamDef';

/**
 * Interface any query-params-state schema needs to extend.
 */
export type IQueryParamsStateSchema = Record<string, QueryParamDef<any>>;

/**
 * The Javascript state representing the content of the URL query string based on the associated
 * query-params-state schema.
 */
export type QueryParamsState<S extends IQueryParamsStateSchema> = {
  [K in keyof S]: S[K] extends QueryParamDef<infer T>
    ? T | null | undefined
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
export type RawQueryParams<S extends IQueryParamsStateSchema> = Record<
  keyof S,
  string | null | undefined
>;

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
export type DefaultValue<T> = T | DefaultValueFunction<T> | undefined | null;

export type ValidatorFunction<T> = (
  value: T,
  queryParams: object,
  contextData: any
) => void;

export type SerializerToUrlFunction<T> = (
  param?: T | null
) => string | null | undefined;

export type SerializerFromUrlFunction<T> = (
  param?: string | null
) => T | null | undefined;

export type Serializer<T> = {
  toUrl: SerializerToUrlFunction<T>;
  fromUrl: SerializerFromUrlFunction<T>;
};
