import { TypedQueryParamsConfig, KeyObject } from './types';

import { useCallback, useMemo } from 'react';
import qs from 'qs';

import { useHistory, useLocation } from 'react-router-dom';

import { isUndefined, isFunction } from './utils';

export function useTypedQueryParams(
  config: TypedQueryParamsConfig
): Array<any> {
  const history = useHistory();
  const location = useLocation();
  const rawQueryParams = useQueryParams();

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
  }, [parsedQueryParamsHash]);

  const setTypedQueryParams = useCallback(
    newQueryParams => {
      const queryParams = {
        ...rawQueryParams,
        ...newQueryParams,
      };
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
    [history, location, rawQueryParams]
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
function useQueryParams(): KeyObject {
  const location = useLocation();
  const queryString = location.search.replace(/^\?/, '');

  return qs.parse(queryString);
}

/**
 * Parse each individual query params with the parser provided for each prop
 * in the config. If provided, use the default value when the parser returns
 * null or undefined. This function does not validate each prop, it only converts it
 * from a string to the right type.
 * @param config
 * @param queryParams - Raw query params extracted from the URL but not parsed.
 */
function deserializeQueryParamsValues(
  config: TypedQueryParamsConfig,
  queryParams: KeyObject
): object {
  return Object.keys(config).reduce((acc, propKey) => {
    const { parser, defaultValue } = config[propKey];
    let value = parser.fromUrl(queryParams[propKey]);
    acc[propKey] =
      !isUndefined(value) && value !== null
        ? value
        : getDefaultValue(defaultValue);

    return acc;
  }, {} as KeyObject);
}

function serializeQueryParamsValues(
  config: TypedQueryParamsConfig,
  queryParams: KeyObject
): object {
  return Object.keys(queryParams).reduce((acc, propKey) => {
    const { parser } = config[propKey];
    let value = parser.toUrl(queryParams[propKey]);
    if (!isUndefined(value)) {
      acc[propKey] = value;
    }

    return acc;
  }, {} as KeyObject);
}

/**
 * For each query param where a validator function was provided, run the validator function.
 * If the validation fails, the provided default value will be used.
 * @param config
 * @param parsedQueryParams
 */
function runParamsValidators(
  config: TypedQueryParamsConfig,
  parsedQueryParams: KeyObject
): KeyObject {
  return Object.keys(config).reduce((acc, propKey) => {
    const { validator, defaultValue } = config[propKey];
    if (validator) {
      const paramValue = parsedQueryParams[propKey];
      try {
        validator(paramValue, parsedQueryParams);
      } catch (err) {
        // The parsed value is incorrect, use the default value instead.
        acc[propKey] = defaultValue;
      }
    }

    return acc;
  }, parsedQueryParams);
}

/**
 * TODO: For the moment, there is no much point of using a default value as a function
 * as we are not passing any runtime props yet.
 * This can still be useful if we want to get the default based on the latest
 * value in local storage for example.
 * @param defaultValue
 */
function getDefaultValue(defaultValue: any): any {
  if (isFunction(defaultValue)) {
    return defaultValue();
  }

  return defaultValue;
}
