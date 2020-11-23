import { useLocation } from 'react-router-dom';

import {
  IQueryParamsStateSchema,
  QueryParams,
  QueryStringBuilderFunction,
  QS_BUILD_STRATEGY,
} from './types';

import { buildQueryStringFromCurrentURL } from './internal/buildQueryStringFromCurrentURL';

/**
 * React hook returning a function to build a new query string from the current
 * URL location query string. This is useful if you want to create a new query string
 * while preserving some parameters from the current one.
 */
export function useBuildQueryStringFromCurrentURL<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamsSchema: QueryParamsSchema
): QueryStringBuilderFunction<QueryParamsSchema> {
  const location = useLocation();

  function buildQueryString(
    newQueryParams?: Partial<QueryParams<QueryParamsSchema>>,
    buildStrategy: QS_BUILD_STRATEGY = QS_BUILD_STRATEGY.PRESERVE_ALL,
    contextData?: any
  ): string {
    return buildQueryStringFromCurrentURL(
      location,
      queryParamsSchema,
      newQueryParams,
      buildStrategy,
      contextData
    );
  }

  return buildQueryString;
}
