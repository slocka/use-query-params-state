import { IQueryParamsSchema, QueryParams } from './types';

import { useQueryParamsState } from './useQueryParamsState';

/**
 * Helper to create a custom UrlParser object.
 * @param toUrl - Function to stringify your value.
 * @param fromUrl - Function to parse your stringified value.
 */
// export function createCustomUrlParser(
//   serializer: (param: any) => string | null | undefined,
//   deserializer: (url?: string | null) => any
// ): QueryParamType {
//   return {
//     toUrl: serializer,
//     fromUrl: deserializer,
//   };
// }

/**
 * Create a hook to read your query params as defined in the provided
 * queryParamsConfig.
 * @param queryParamsConfig
 */
export function createUseQueryParamsStateHook<
  QueryParamsSchema extends IQueryParamsSchema
>(queryParamsSchena: QueryParamsSchema) {
  return (contextData?: any) => {
    return useQueryParamsState(queryParamsSchena, contextData);
  };
}

export function getDefaultQueryParamsState<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema,
  contextData?: any
): QueryParams<QueryParamsSchema> {
  return Object.keys(queryParamsSchema).reduce(
    (acc, queryParamKey: keyof QueryParamsSchema) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      acc[queryParamKey] = queryParamDef.getDefaultValue(contextData);
      return acc;
    },
    {} as QueryParams<QueryParamsSchema>
  );
}
