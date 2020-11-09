import { QueryParamDef } from './queryParamDef';

export enum QS_BUILD_STRATEGY {
  PRESERVE_ALL,
  PRESERVE_EXTERNAL_ONLY,
  PRESERVE_ALL_WITH_DEFAULT,
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

export type ParamTypeToSerializerMap = Record<string, Serializer<any>>;

export type DefaultValueFunction<T> = (context?: any) => T;
export type DefaultValue<T> = T | DefaultValueFunction<T> | undefined | null;
