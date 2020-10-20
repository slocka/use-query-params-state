import { QueryParamDef } from './queryParamDef';

export type ValidatorFunction<T> = (
  value: T,
  queryParams: object,
  contextData: any
) => void;

export type IQueryParamsSchema = Record<string, QueryParamDef<any>>;
export type QueryParams<S extends IQueryParamsSchema> = Record<keyof S, any>;
export type QueryParamsSetter<T extends IQueryParamsSchema> = (
  newQueryParams: Partial<QueryParams<T>>
) => void;
export type RawQueryParams<S extends IQueryParamsSchema> = Record<
  keyof S,
  string | null | undefined
>;

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
export type DefaultValue<T> = T | DefaultValueFunction<T> | undefined;
