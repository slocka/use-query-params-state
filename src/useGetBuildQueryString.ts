import { useLocation } from 'react-router-dom';

import {
  IQueryParamsSchema,
  QueryParams,
  QueryStringBuilderFunction,
  QS_BUILD_STRATEGY,
} from './types';

import { buildQueryStringFromCurrentState } from './helpers';

export function useGetBuildQueryString<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema
): QueryStringBuilderFunction<QueryParamsSchema> {
  const location = useLocation();

  function buildQueryString(
    newQueryParams?: Partial<QueryParams<QueryParamsSchema>>,
    buildStrategy?: QS_BUILD_STRATEGY,
    contextData?: any
  ) {
    return buildQueryStringFromCurrentState(
      location,
      queryParamsSchema,
      newQueryParams,
      buildStrategy,
      contextData
    );
  }

  return buildQueryString;
}
