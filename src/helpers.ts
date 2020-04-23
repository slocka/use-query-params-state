import {
  ParserOptions,
  UrlParser,
  TypedQueryParamsConfig,
  TypedQueryParamsPropConfig,
} from './types';

import { isUndefined, isFunction } from './lib';
import { QueryParamsConfigError } from './errors';
import { useQueryParamsState } from './hooks';

export function defineProp(
  propParser: UrlParser,
  propParserOptions: ParserOptions = {}
): TypedQueryParamsPropConfig {
  if (!propParser) {
    throw new QueryParamsConfigError('Missing parser definition.');
  }

  return {
    parser: propParser,
    defaultValue: !isUndefined(propParserOptions.defaultValue)
      ? propParserOptions.defaultValue
      : null,
    validator: isFunction(propParserOptions.validator)
      ? propParserOptions.validator
      : null,
  };
}

/**
 * Helper to create a custom UrlParser object.
 * @param toUrl - Function to stringify your value.
 * @param fromUrl - Function to parse your stringified value.
 */
export function createCustomUrlParser(
  serializer: (param: any) => string,
  deserializer: (url: string) => any
): UrlParser {
  return {
    toUrl: serializer,
    fromUrl: deserializer,
  };
}

/**
 * Create a hook to read your query params as defined in the provided
 * typedQueryParamsConfig.
 * @param typedQueryParamsConfig
 */
export function createTypedQueryParamsHook(
  typedQueryParamsConfig: TypedQueryParamsConfig
) {
  return () => {
    return useQueryParamsState(typedQueryParamsConfig);
  };
}
