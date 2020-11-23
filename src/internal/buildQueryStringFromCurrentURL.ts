import { useLocation } from 'react-router-dom';

import {
  IQueryParamsStateSchema,
  QueryParams,
  QS_BUILD_STRATEGY,
} from '../types';

import {
  getAllRawQueryParamsFromURL,
  getExternalQueryParamsFromURL,
} from './getQueryParamsFromURL';

import { serializeQueryParamsValues } from './serializer/serialize';
import { getDefaultQueryParamsState } from './getDefaultQueryParamsState';
import { buildQueryString } from '../buildQueryString';

/**
 * @internal
 */
export function buildQueryStringFromCurrentURL<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  location: ReturnType<typeof useLocation>,
  queryParamsSchema: QueryParamsSchema,
  newQueryParams: Partial<QueryParams<QueryParamsSchema>> = {},
  buildStrategy: QS_BUILD_STRATEGY = QS_BUILD_STRATEGY.PRESERVE_ALL,
  contextData?: any
): string {
  const rawQueryParamsMergeDestination = getMergeDestination(
    location,
    queryParamsSchema,
    buildStrategy,
    contextData
  );

  return buildQueryString(
    queryParamsSchema,
    newQueryParams,
    contextData,
    rawQueryParamsMergeDestination
  );
}

/**
 * Get object in which the new query params are going be merged into.
 * The returned object has its valued already stringified.
 */
function getMergeDestination<QueryParamsSchema extends IQueryParamsStateSchema>(
  location: ReturnType<typeof useLocation>,
  queryParamsSchema: QueryParamsSchema,
  buildStrategy: QS_BUILD_STRATEGY,
  contextData?: any
): Record<string, string | null | undefined> {
  const allRawQueryParams = getAllRawQueryParamsFromURL(location);
  const externalQueryParams = getExternalQueryParamsFromURL(
    location,
    queryParamsSchema
  );

  if (buildStrategy === QS_BUILD_STRATEGY.PRESERVE_ALL) {
    return allRawQueryParams;
  }

  if (buildStrategy === QS_BUILD_STRATEGY.PRESERVE_EXTERNAL_ONLY) {
    return externalQueryParams;
  }

  if (buildStrategy === QS_BUILD_STRATEGY.PRESERVE_NONE) {
    return {};
  }

  if (buildStrategy === QS_BUILD_STRATEGY.PRESERVE_ALL_WITH_DEFAULT) {
    const defaultParams = getDefaultQueryParamsState(
      queryParamsSchema,
      contextData
    );

    return {
      ...serializeQueryParamsValues(queryParamsSchema, defaultParams),
      ...allRawQueryParams,
    };
  }

  throw new Error('Unknown buildStrategy.');
}
