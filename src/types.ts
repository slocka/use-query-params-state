export type KeyObject = { [key: string]: any };

/**
 * Config object to define :
 *  - Which params can be read/updated from the URL
 *  - How to serialize/deserialize each param.
 *  - Validate the params.
 *  - A default value
 */
export type queryParamsConfig = {
  [key: string]: queryParamConfig;
};

export type ValidatorFunction = (value: any, queryParams: object) => void;

/**
 * Object containing two function
 * used to serialize/deserialize the query parameters.
 */
export interface queryParamType {
  toUrl: (param: any) => string | undefined;
  fromUrl: (url: string) => any;
}

export interface ParserOptions {
  defaultValue?: any;
  validator?: (value: any) => void;
}

export interface queryParamConfig {
  type?: queryParamType;
  defaultValue?: any;
  validator?: ValidatorFunction;
}

export interface NormalizedQueryParamsConfig {
  [key: string]: NormalizedQueryParamConfig;
}

export interface NormalizedQueryParamConfig {
  type: queryParamType;
  defaultValue?: any;
  validator?: ValidatorFunction;
}
