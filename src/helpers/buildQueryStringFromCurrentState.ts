import { useLocation } from 'react-router-dom';

import { IQueryParamsSchema, QueryParams } from '../types';

import {
  getAllRawQueryParamsFromURL,
  getExternalQueryParamsFromURL,
} from './getQueryParamsFromURL';

import { runParamsValidatorsPartial } from '../validators';
import { serializeQueryParamsValues } from '../serializer/serialize';

import { createQueryString } from '../lib';

/**
 *
 */
export function buildQueryStringFromCurrentState<
  QueryParamsSchema extends IQueryParamsSchema
>(
  location: ReturnType<typeof useLocation>,
  queryParamsSchema: QueryParamsSchema,
  newQueryParams: Partial<QueryParams<QueryParamsSchema>>,
  isPartialUpdate: boolean,
  contextData?: any
) {
  const allRawQueryParams = getAllRawQueryParamsFromURL(location);
  const externalQueryParams = getExternalQueryParamsFromURL(
    location,
    queryParamsSchema
  );

  const rawQueryParamsMergeDestination = isPartialUpdate
    ? { ...allRawQueryParams }
    : { ...externalQueryParams };

  // Raise a JS error if we are trying to set a value that doesn't pass the validator
  runParamsValidatorsPartial(
    queryParamsSchema,
    newQueryParams,
    contextData,
    /** throwOnError */ true
  );

  const serializedQueryParams = {
    ...rawQueryParamsMergeDestination,
    ...serializeQueryParamsValues(queryParamsSchema, newQueryParams),
  };

  return createQueryString(serializedQueryParams);
}
