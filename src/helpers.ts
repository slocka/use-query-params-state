import { QueryParamsConfig, QueryParamType } from './types';

import { useQueryParamsState } from './hooks';

/**
 * Helper to create a custom UrlParser object.
 * @param toUrl - Function to stringify your value.
 * @param fromUrl - Function to parse your stringified value.
 */
export function createCustomUrlParser(
  serializer: (param: any) => string | null | undefined,
  deserializer: (url?: string | null) => any
): QueryParamType {
  return {
    toUrl: serializer,
    fromUrl: deserializer,
  };
}

/**
 * Create a hook to read your query params as defined in the provided
 * queryParamsConfig.
 * @param queryParamsConfig
 */
export function createUseQueryParamsStateHook(
  queryParamsConfig: QueryParamsConfig
) {
  return () => {
    return useQueryParamsState(queryParamsConfig);
  };
}
