import {
  RawQueryParams,
  IQueryParamsStateSchema,
  QueryParamsState,
} from '../types';
import { serializeQueryParamsValues } from '../internal/serializer/serialize';

/**
 * Convert each queryParams value to its "raw" (stringified) version based
 * on the provided schema.
 * @internal
 */
export function getRawQueryParams<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParams: QueryParamsState<QueryParamsSchema>,
  queryParamsSchema: QueryParamsSchema
): RawQueryParams<QueryParamsSchema> {
  return serializeQueryParamsValues(queryParamsSchema, queryParams);
}
