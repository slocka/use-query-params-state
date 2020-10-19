import { useCallback, useMemo } from 'react';
import qs from 'qs';
import { useHistory, useLocation } from 'react-router-dom';

import { QueryParamsSchema } from './types';

import {
  serializeQueryParamsValues,
  deserializeQueryParamsValues,
} from './serializer/serialize';

import { runParamsValidators } from './validators';

export function useQueryParamsState(
  queryParamsSchema: QueryParamsSchema,
  contextData?: any
): Array<any> {
  const history = useHistory();
  const location = useLocation();
  const rawQueryParams = useReactRouterQueryParams();

  // Convert queryParams values from string to the type defined for each query param.
  const parsedQueryParams = deserializeQueryParamsValues(
    queryParamsSchema,
    rawQueryParams,
    contextData
  );

  const parsedQueryParamsHash = JSON.stringify(parsedQueryParams);
  // Keep the same object reference as long as the hash stays the same.
  // We could have used rawQueryParams instead of the hash of parsedQueryParams,
  // but we want to ignore other query strings params.
  const queryParamsState = useMemo(() => {
    // Validate each prop if a validator function has been provided.
    return runParamsValidators(
      queryParamsSchema,
      parsedQueryParams,
      contextData
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedQueryParamsHash, queryParamsSchema]);

  const setQueryParamsState = useCallback(
    newQueryParams => {
      // Raise a JS error if we are trying to set a value that doesn't pass the validator
      runParamsValidators(
        queryParamsSchema,
        newQueryParams,
        contextData,
        /** throwOnError */ true
      );

      const queryParams = {
        ...rawQueryParams,
        ...newQueryParams,
      };

      /** TODO: Shall we push param if value is equal to the default value? */

      const serializedQueryParams = {
        ...queryParams,
        ...serializeQueryParamsValues(queryParamsSchema, newQueryParams),
      };

      const newQueryString = qs.stringify(serializedQueryParams);

      const newLocation = {
        ...location,
        search: `?${newQueryString}`,
      };

      history.push(newLocation);
    },
    [history, location, rawQueryParams, queryParamsSchema, contextData]
  );

  return [queryParamsState, setQueryParamsState];
}

/**
 * Extract parameters from query string and return
 * them in the shape of a key/value object.
 */
function useReactRouterQueryParams(): Record<string, string> {
  const location = useLocation();
  const queryString = location.search.replace(/^\?/, '');

  return qs.parse(queryString);
}
