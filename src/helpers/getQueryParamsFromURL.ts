import { IQueryParamsSchema, RawQueryParams } from '../types';

import { useLocation } from 'react-router-dom';

import { parseQueryString } from '../lib';

export function getAllRawQueryParamsFromURL(
  location: ReturnType<typeof useLocation>
) {
  const queryString = location.search.replace(/^\?/, '');

  return parseQueryString(queryString);
}

export function getRawQueryParamsInSchemaFromURL<
  QueryParamsSchema extends IQueryParamsSchema
>(
  location: ReturnType<typeof useLocation>,
  schema: QueryParamsSchema
): Partial<RawQueryParams<QueryParamsSchema>> {
  const allRawQueryParams = getAllRawQueryParamsFromURL(location);

  return Object.keys(allRawQueryParams).reduce(
    (
      acc: Partial<RawQueryParams<QueryParamsSchema>>,
      queryParamKey: string
    ) => {
      if (schema.hasOwnProperty(queryParamKey)) {
        acc[queryParamKey as keyof QueryParamsSchema] =
          allRawQueryParams[queryParamKey];
      }
      return acc;
    },
    {}
  );
}
