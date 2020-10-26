import { RawQueryParams, IQueryParamsSchema, QueryParams } from '../types';
import { serializeQueryParamsValues } from '../serializer/serialize';

/**
 * Convert each queryParams value to its "raw" (stringified) version based
 * on the provided schema.
 */
export function getRawQueryParams<QueryParamsSchema extends IQueryParamsSchema>(
  queryParams: QueryParams<QueryParamsSchema>,
  queryParamsSchema: QueryParamsSchema
): RawQueryParams<QueryParamsSchema> {
  return serializeQueryParamsValues(queryParamsSchema, queryParams);
}
