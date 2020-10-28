import { useLocation } from 'react-router-dom';

import {
  IQueryParamsSchema,
  QueryParams,
  QueryStringBuilderFunction,
  QS_BUILD_STRATEGY,
} from './types';

import { buildQueryStringFromCurrentURL } from './helpers';

export function useBuildQueryStringFromCurrentURL<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema
): QueryStringBuilderFunction<QueryParamsSchema> {
  const location = useLocation();

  function buildQueryString(
    newQueryParams?: Partial<QueryParams<QueryParamsSchema>>,
    buildStrategy: QS_BUILD_STRATEGY = QS_BUILD_STRATEGY.NEW,
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
