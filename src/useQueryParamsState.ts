import { useCallback, useMemo } from 'react';
import { parseQueryString, createQueryString } from './lib';
import { useHistory, useLocation } from 'react-router-dom';

import {
  IQueryParamsSchema,
  QueryParams,
  QueryParamsSetter,
  RawQueryParams,
} from './types';

import {
  serializeQueryParamsValues,
  deserializeQueryParamsValues,
} from './serializer/serialize';

import { runParamsValidators } from './validators';
import { getDefaultQueryParamsState } from './helpers';

export function useQueryParamsState<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema,
  contextData?: any
): [QueryParams<QueryParamsSchema>, QueryParamsSetter<QueryParamsSchema>] {
  const rawQueryParams = useRawQueryParamsFromUrl(queryParamsSchema);

  // Convert queryParams values from string to the type defined for each query param.
  const queryParams = deserializeQueryParamsValues(
    queryParamsSchema,
    rawQueryParams,
    contextData
  );

  const parsedQueryParamsHash = JSON.stringify(queryParams);
  // Keep the same object reference as long as the hash stays the same.
  // We could have used rawQueryParams instead of the hash of parsedQueryParams,
  // but we want to ignore other query strings params.
  const queryParamsState = useMemo(() => {
    // Validate each prop if a validator function has been provided.
    return runParamsValidators(queryParamsSchema, queryParams, contextData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedQueryParamsHash, queryParamsSchema]);

  const setQueryParamsState = useSetQueryParamsState(
    queryParamsSchema,
    queryParamsState,
    contextData
  );

  return [queryParamsState, setQueryParamsState];
}

/**
 * Extract parameters from query string and return
 * the ones that are contained in the schema in the shape
 * of a key/value object.
 * The current implementation is tight to React-router.
 */
function useRawQueryParamsFromUrl<QueryParamsSchema extends IQueryParamsSchema>(
  schema: QueryParamsSchema
): RawQueryParams<QueryParamsSchema> {
  const location = useLocation();
  const queryString = location.search.replace(/^\?/, '');

  const queryStringParams = parseQueryString(queryString);
  return Object.keys(queryStringParams).reduce(
    (acc, queryStringKey: string) => {
      if (schema.hasOwnProperty(queryStringKey)) {
        acc[queryStringKey as keyof QueryParamsSchema] =
          queryStringParams[queryStringKey];
      }
      return acc;
    },
    {} as RawQueryParams<QueryParamsSchema>
  );
}

function useSetQueryParamsState<QueryParamsSchema extends IQueryParamsSchema>(
  queryParamsSchema: QueryParamsSchema,
  queryParamsState: QueryParams<QueryParamsSchema>,
  contextData?: any
): QueryParamsSetter<QueryParamsSchema> {
  const history = useHistory();
  const location = useLocation();

  return useCallback(
    (newQueryParams, isPartialUpdate = true) => {
      const queryParamsStateMergeDestination = isPartialUpdate
        ? { ...queryParamsState }
        : getDefaultQueryParamsState(queryParamsSchema, contextData);

      let newQueryParamsState = {
        ...queryParamsStateMergeDestination,
        ...newQueryParams,
      };

      // Raise a JS error if we are trying to set a value that doesn't pass the validator
      runParamsValidators(
        queryParamsSchema,
        newQueryParamsState,
        contextData,
        /** throwOnError */ true
      );

      /** TODO: Shall we push param if value is equal to the default value? */

      const serializedQueryParams = {
        ...serializeQueryParamsValues(queryParamsSchema, newQueryParamsState),
      };

      /** TODO: We shouldn't remove exsiting query params outside of the schema */
      const newQueryString = createQueryString(serializedQueryParams);

      const newLocation = {
        ...location,
        search: `?${newQueryString}`,
      };

      history.push(newLocation);
    },
    [history, location, queryParamsState, queryParamsSchema, contextData]
  );
}
