import { IQueryParamsStateSchema, QueryParams } from './types';

import { runParamsValidatorsPartial } from './validators';
import { serializeQueryParamsValues } from './internal/serializer/serialize';
import { createQueryString } from './internal/queryString';

/**
 * Create a new query string based on the provided schema and a matching query params object.
 * An error will be thrown if the param does not match the type defined in the schema.
 */
export function buildQueryString<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  /**
   * The parameters schema followed by the query string.
   */
  queryParamsSchema: QueryParamsSchema,
  /**
   * The query parameters you want to add to the query string and belong
   * to the schema.
   */
  newQueryParams: Partial<QueryParams<QueryParamsSchema>> = {},
  contextData?: any,
  /**
   * The query parameters you want to add to the query string but don't
   * belong to the schema. Each parameter value is expected to already be in its
   * string format.
   */
  otherRawParams?: Record<string, string | null | undefined>
): string {
  // Raise a JS error if we are trying to set a value that doesn't pass the validator
  runParamsValidatorsPartial(
    queryParamsSchema,
    newQueryParams,
    contextData,
    /** throwOnError */ true
  );

  const serializedQueryParams = {
    ...otherRawParams,
    ...serializeQueryParamsValues(queryParamsSchema, newQueryParams),
  };

  return createQueryString(serializedQueryParams);
}
