import { useCallback, useMemo } from 'react';
import qs from 'qs';
import { useHistory, useLocation } from 'react-router-dom';

import { TypedQueryParamsConfig, KeyObject } from './types';
import {
  serializeQueryParamsValues,
  deserializeQueryParamsValues,
} from './serializer';
import { runParamsValidators } from './validators';

export function useTypedQueryParams(
  config: TypedQueryParamsConfig
): Array<any> {
  const history = useHistory();
  const location = useLocation();
  const rawQueryParams = useReactRouterQueryParams();

  // Convert queryParams values from string to the type defined for each query param.
  const parsedQueryParams = deserializeQueryParamsValues(
    config,
    rawQueryParams
  );

  const parsedQueryParamsHash = JSON.stringify(parsedQueryParams);
  // Keep the same object reference as long as the hash stays the same.
  // We could have used rawQueryParams instead of the hash of parsedQueryParams,
  // but we want to ignore other query strings params.
  const validatedQueryParams = useMemo(() => {
    // Validate each prop if a validator function has been provided.
    return runParamsValidators(config, parsedQueryParams);
  }, [parsedQueryParamsHash, config]);

  const setTypedQueryParams = useCallback(
    newQueryParams => {
      const queryParams = {
        ...rawQueryParams,
        ...newQueryParams,
      };

      // Raise a JS error if we are trying to set a value that doesn't pass the validator
      runParamsValidators(config, newQueryParams, /** throwOnError */ true);

      /** TODO: Shall we push param if value is equal to the default value? */

      const serializedQueryParams = serializeQueryParamsValues(
        config,
        queryParams
      );
      const newQueryString = qs.stringify(serializedQueryParams);

      const newLocation = {
        ...location,
        search: `?${newQueryString}`,
      };

      history.push(newLocation);
    },
    [history, location, rawQueryParams, config]
  );

  /**
   * Probably we should always return the same reference if the params value hasn't changed.
   */
  return [validatedQueryParams, setTypedQueryParams, config];
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
