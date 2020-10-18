import { QueryParamDef } from './queryParamDef';

export type ValidatorFunction<T> = (value: T, queryParams: object) => void;

export type SerializedQueryParams = Record<string, string | null | undefined>;
export type QueryParamsSchema = Record<string, QueryParamDef<any>>;
export type QueryParams = Record<string, any>;

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
export type DefaultValue<T> = T | DefaultValueFunction<T> | undefined;
