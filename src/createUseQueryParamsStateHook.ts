import { IQueryParamsSchema } from './types';
import { useQueryParamsState } from './useQueryParamsState';

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
