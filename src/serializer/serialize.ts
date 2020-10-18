import { isUndefined } from '../lib';
import {
  QueryParams,
  SerializedQueryParams,
  QueryParamsSchema,
} from '../types';

import { QueryParamsUpdateError } from '../errors';

/**
 * Parse each individual query params with the parser provided for each prop
 * in the config. If provided, use the default value when the parser returns
 * null or undefined. This function does not validate each prop, it only converts it
 * from a string to the right type.
 * @param config
 * @param queryParams - Raw query params extracted from the URL but not parsed.
 */
export function deserializeQueryParamsValues(
  queryParamsSchema: QueryParamsSchema,
  serializedQueryParams: SerializedQueryParams
): QueryParams {
  return Object.keys(queryParamsSchema).reduce((acc, queryParamKey) => {
    const queryParamDef = queryParamsSchema[queryParamKey];
    acc[queryParamKey] = queryParamDef.fromURL(
      serializedQueryParams[queryParamKey]
    );

    return acc;
  }, {} as QueryParams);
}

export function serializeQueryParamsValues(
  queryParamsSchema: QueryParamsSchema,
  queryParams: QueryParams
): SerializedQueryParams {
  return Object.keys(queryParams).reduce((acc, queryParamKey) => {
    const queryParamDef = queryParamsSchema[queryParamKey];
    if (!queryParamDef) {
      const availableQueryParamsKeys = Object.keys(queryParamsSchema);
      throw new QueryParamsUpdateError(
        `"${queryParamKey}" is not defined in queryParams Schema. Defined query params are: ${JSON.stringify(
          availableQueryParamsKeys
        )}.`
      );
    }
    let value = queryParamDef.toURL(queryParams[queryParamKey]);
    if (!isUndefined(value)) {
      acc[queryParamKey] = value;
    }

    return acc;
  }, {} as SerializedQueryParams);
}
