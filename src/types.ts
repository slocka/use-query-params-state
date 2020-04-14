export type KeyObject = { [key: string]: any };

/**
 * Config object to define :
 *  - Which params can be read/updated from the URL
 *  - How to serialise/deserialize each param.
 *  - Validate the params.
 *  - A default value
 */
export type TypedQueryParamsConfig = {
  [key: string]: TypedQueryParamsPropConfig;
};

export type ValidatorFunction = (value: any, queryParams: object) => void;

/**
 * Object containing two function
 * used to serialize/deserialize the query parameters.
 */
export interface UrlParser {
  toUrl: (param: any) => string;
  fromUrl: (url: string) => any;
}

export interface ParserOptions {
  defaultValue?: any;
  validator?: (value: any) => void;
}

export interface TypedQueryParamsPropConfig {
  parser: UrlParser;
  defaultValue: any;
  validator: ValidatorFunction | null | undefined;
}
