import {
  QueryParamsState,
  RawQueryParams,
  IQueryParamsStateSchema,
} from '../../types';

import { Errors } from '../../errors';

/**
 * Parse each individual query params with the parser provided for each prop
 * in the config. If provided, use the default value when the parser returns
 * null or undefined. This function does not validate each prop, it only converts it
 * from a string to the right type.
 * @param config
 * @param queryParams - Raw query params extracted from the URL but not parsed.
 */
export function deserializeQueryParamsValues<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamsSchema: QueryParamsSchema,
  rawQueryParams: Partial<RawQueryParams<QueryParamsSchema>>,
  contextData?: any
): QueryParamsState<QueryParamsSchema> {
  return Object.keys(queryParamsSchema).reduce(
    (acc, queryParamKey: keyof QueryParamsSchema) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      // if (queryParamKey in rawQueryParams) {
      const rawValue = rawQueryParams[queryParamKey] as string;
      acc[queryParamKey] = queryParamDef.fromURL(rawValue, contextData);
      // }

      return acc;
    },
    {} as QueryParamsState<QueryParamsSchema>
  );
}

export function serializeQueryParamsValues<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamsSchema: QueryParamsSchema,
  queryParams: Partial<QueryParamsState<QueryParamsSchema>>
): RawQueryParams<QueryParamsSchema> {
  return Object.keys(queryParams).reduce(
    (
      acc: RawQueryParams<QueryParamsSchema>,
      queryParamKey: keyof QueryParamsSchema
    ) => {
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
        acc[queryParamKey] = value;
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
