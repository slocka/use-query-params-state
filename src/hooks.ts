import { useCallback, useMemo } from 'react';
import qs from 'qs';
import { useHistory, useLocation } from 'react-router-dom';

import { queryParamsConfig, KeyObject } from './types';
import {
  serializeQueryParamsValues,
  deserializeQueryParamsValues,
} from './serializer/serialize';

import { runParamsValidators } from './validators';
import { normalizeConfig } from './lib';

export function useQueryParamsState(config: queryParamsConfig): Array<any> {
  const normalizedConfig = useMemo(() => normalizeConfig(config), [config]);
  const history = useHistory();
  const location = useLocation();
  const rawQueryParams = useReactRouterQueryParams();

  // Convert queryParams values from string to the type defined for each query param.
  const parsedQueryParams = deserializeQueryParamsValues(
    normalizedConfig,
    rawQueryParams
  );

  const parsedQueryParamsHash = JSON.stringify(parsedQueryParams);
  // Keep the same object reference as long as the hash stays the same.
  // We could have used rawQueryParams instead of the hash of parsedQueryParams,
  // but we want to ignore other query strings params.
  const queryParamsState = useMemo(() => {
    // Validate each prop if a validator function has been provided.
    return runParamsValidators(normalizedConfig, parsedQueryParams);
  }, [parsedQueryParamsHash, normalizedConfig]);

  const setQueryParamsState = useCallback(
    newQueryParams => {
      const queryParams = {
        ...rawQueryParams,
        ...newQueryParams,
      };

      // Raise a JS error if we are trying to set a value that doesn't pass the validator
      runParamsValidators(
        normalizedConfig,
        newQueryParams,
        /** throwOnError */ true
      );

      /** TODO: Shall we push param if value is equal to the default value? */

      const serializedQueryParams = {
        ...queryParams,
        ...serializeQueryParamsValues(normalizedConfig, newQueryParams),
      };

      const newQueryString = qs.stringify(serializedQueryParams);

      const newLocation = {
        ...location,
        search: `?${newQueryString}`,
      };

      history.push(newLocation);
    },
    [history, location, rawQueryParams, normalizedConfig]
  );

  return [queryParamsState, setQueryParamsState, normalizedConfig];
}

/**
 * Extract parameters from query string and return
 * them in the shape of a key/value object.
 */
function useReactRouterQueryParams(): KeyObject {
  const location = useLocation();
  const queryString = location.search.replace(/^\?/, '');

  return qs.parse(queryString);
}
