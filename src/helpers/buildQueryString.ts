import { useLocation } from 'react-router-dom';

import { IQueryParamsSchema, QueryParams, QS_BUILD_STRATEGY } from '../types';

import {
  getAllRawQueryParamsFromURL,
  getExternalQueryParamsFromURL,
} from './getQueryParamsFromURL';

import { runParamsValidatorsPartial } from '../validators';
import { serializeQueryParamsValues } from '../serializer/serialize';
import { getDefaultQueryParamsState } from './getDefaultQueryParamsState';
import { createQueryString } from '../lib';

export function buildQueryStringFromCurrentURL<
  QueryParamsSchema extends IQueryParamsSchema
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

export function buildQueryString<QueryParamsSchema extends IQueryParamsSchema>(
  queryParamsSchema: QueryParamsSchema,
  newQueryParams: Partial<QueryParams<QueryParamsSchema>> = {},
  contextData?: any,
  // Other params that won't be validated nor transformed.
  otherRawParams?: Record<string, string | null | undefined>
) {
  // Raise a JS error if we are trying to set a value that doesn't pass the validator
  runParamsValidatorsPartial(
    queryParamsSchema,
    newQueryParams,
    contextData,
    /** throwOnError */ true
  );

  const serializedQueryParams = {
    ...otherRawParams,
    ...serializeQueryParamsValues(queryParamsSchema, newQueryParams),
  };

  return createQueryString(serializedQueryParams);
}

/**
 * Get object in which the new query params are going be merged into.
 * The returned object has its valued already stringified.
 */
function getMergeDestination<QueryParamsSchema extends IQueryParamsSchema>(
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