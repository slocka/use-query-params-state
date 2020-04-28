/**
 * Config object to define :
 *  - Which params can be read/updated from the URL
 *  - How to serialize/deserialize each param.
 *  - Validate the params.
 *  - A default value
 */
export type QueryParamsConfig = Record<string, Partial<QueryParamOptions>>;
export type QueryParamsNormalizedConfig = Record<string, QueryParamOptions>;

export type ValidatorFunction = (value: any, queryParams: object) => void;

/**
 * Object containing two function
 * used to serialize/deserialize the query parameters.
 */
export interface QueryParamType {
  toUrl: (param: any) => string | null | undefined;
  fromUrl: (url?: string | null) => any;
}

export interface QueryParamOptions {
  type: QueryParamType;
  defaultValue?: any;
  validator?: ValidatorFunction;
}

export type SerializedQueryParams = Record<string, string | null | undefined>;
export type QueryParams = Record<string, any>;
