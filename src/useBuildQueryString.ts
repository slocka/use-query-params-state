import { useLocation } from 'react-router-dom';

import {
  IQueryParamsSchema,
  QueryParams,
  QueryStringBuilderFunction,
  QS_BUILD_STRATEGY,
} from './types';

import { buildQueryString as buildQueryStringHelper } from './helpers';

export function useBuildQueryString<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema
): QueryStringBuilderFunction<QueryParamsSchema> {
  const location = useLocation();

  function buildQueryString(
    newQueryParams?: Partial<QueryParams<QueryParamsSchema>>,
    buildStrategy?: QS_BUILD_STRATEGY,
    contextData?: any
  ): string {
    return buildQueryStringHelper(
      location,
      queryParamsSchema,
      newQueryParams,
      buildStrategy,
      contextData
    );
  }

  return buildQueryString;
}
