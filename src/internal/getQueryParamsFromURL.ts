import { IQueryParamsStateSchema, RawQueryParams } from '../types';

import { useLocation } from 'react-router-dom';

import { parseQueryString } from '../internal/queryString';

/**
 * @internal
 */
export function getAllRawQueryParamsFromURL(
  location: ReturnType<typeof useLocation>
) {
  const queryString = location.search.replace(/^\?/, '');

  return parseQueryString(queryString);
}

/**
 * @internal
 */
export function getRawQueryParamsInSchemaFromURL<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  location: ReturnType<typeof useLocation>,
  schema: QueryParamsSchema
): Partial<RawQueryParams<QueryParamsSchema>> {
  const allRawQueryParams = getAllRawQueryParamsFromURL(location);

  return Object.keys(allRawQueryParams).reduce(
    (
      acc: Partial<RawQueryParams<QueryParamsSchema>>,
      queryParamKey: keyof QueryParamsSchema
    ) => {
      if (schema.hasOwnProperty(queryParamKey)) {
        const value = allRawQueryParams[queryParamKey as string];
        acc[queryParamKey] = value; // as any fixes the issue??
      }
      return acc;
    },
    {}
  );
}

/**
 * @internal
 */
export function getExternalQueryParamsFromURL<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  location: ReturnType<typeof useLocation>,
  schema: QueryParamsSchema
): Record<string, string | null> {
  const allRawQueryParams = getAllRawQueryParamsFromURL(location);

  return Object.keys(allRawQueryParams).reduce(
    (acc: Record<string, string | null>, queryParamKey: string) => {
      if (!schema.hasOwnProperty(queryParamKey)) {
        acc[queryParamKey] = allRawQueryParams[queryParamKey];
      }
      return acc;
    },
    {}
  );
}
