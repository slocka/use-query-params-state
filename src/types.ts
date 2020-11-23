import { QueryParamDef } from './queryParamDef';

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

export type ValidatorFunction<T> = (
  value: T,
  queryParams: object,
  contextData: any
) => void;

export type IQueryParamsSchema = Record<string, QueryParamDef<any>>;
export type QueryParams<S extends IQueryParamsSchema> = {
  [K in keyof S]: S[K] extends QueryParamDef<infer T>
    ? T | null | undefined
    : never;
};

export type QueryParamsSetter<T extends IQueryParamsSchema> = (
  newQueryParams: Partial<QueryParams<T>>,
  fromCurrent?: boolean
) => void;

export type RawQueryParams<S extends IQueryParamsSchema> = Record<
  keyof S,
  string | null | undefined
>;

export type QueryStringBuilderFunction<T extends IQueryParamsSchema> = (
  newQueryParams?: Partial<QueryParams<T>>,
  buildStrategy?: QS_BUILD_STRATEGY,
  contextData?: any
) => string;

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

export type DefaultValueFunction<T> = (context?: any) => T;
export type DefaultValue<T> = T | DefaultValueFunction<T> | undefined | null;
