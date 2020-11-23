import { isUndefined } from '../lib';
import { QueryParams, RawQueryParams, IQueryParamsSchema } from '../types';

import { Errors } from '../errors';

/**
 * Parse each individual query params with the parser provided for each prop
 * in the config. If provided, use the default value when the parser returns
 * null or undefined. This function does not validate each prop, it only converts it
 * from a string to the right type.
 * @param config
 * @param queryParams - Raw query params extracted from the URL but not parsed.
 */
export function deserializeQueryParamsValues<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema,
  rawQueryParams: Partial<RawQueryParams<QueryParamsSchema>>,
  contextData?: any
): QueryParams<QueryParamsSchema> {
  return Object.keys(queryParamsSchema).reduce(
    (acc, queryParamKey: keyof QueryParamsSchema) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      acc[queryParamKey] = queryParamDef.fromURL(
        rawQueryParams[queryParamKey],
        contextData
      );

      return acc;
    },
    {} as QueryParams<QueryParamsSchema>
  );
}

export function serializeQueryParamsValues<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema,
  queryParams: Partial<QueryParams<QueryParamsSchema>>
): RawQueryParams<QueryParamsSchema> {
  return Object.keys(queryParams).reduce(
    (acc, queryParamKey: keyof QueryParamsSchema) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      if (!queryParamDef) {
        const availableQueryParamsKeys = Object.keys(queryParamsSchema);
        throw new Errors.QueryParamsUpdateError(
          `"${queryParamKey}" is not defined in queryParams Schema. Defined query params are: ${JSON.stringify(
            availableQueryParamsKeys
          )}.`
        );
      }
      try {
        let value = queryParamDef.toURL(queryParams[queryParamKey]);
        if (!isUndefined(value)) {
          acc[queryParamKey] = value;
        }
      } catch (error) {
        // Add query param name information to the error
        error.message = `${queryParamKey} ${error.message}`;
        throw error;
      }
      return acc;
    },
    {} as RawQueryParams<QueryParamsSchema>
  );
}
