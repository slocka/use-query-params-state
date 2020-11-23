import { QueryParams, IQueryParamsStateSchema } from './types';

/**
 * Take an object as input and return a new object keeping only
 * the properties matching the schema.
 *
 * This helper can be useful to transfer query params between two schemas.
 *
 * E.g:
 *  const productSearchQueryParams = { currency: 'EUR', search: "something"}
 *  const productPageQueryParamsSchema  = { currency: QPARAMS.string() }
 *  pickQueryParamsMatchingSchema(productPageQueryParamsSchema, productSearchQueryParams)
 *  => { currency: 'EUR' } // search param has been left out.
 *
 * Note: A property matches the schema if the key is present in it.
 * This util does not do any type validation.
 */
export function pickQueryParamsMatchingSchema<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamsSchema: QueryParamsSchema,
  queryParams: Record<string, any>
): Partial<QueryParams<QueryParamsSchema>> {
  if (!queryParams) {
    return {};
  }
  return Object.keys(queryParamsSchema).reduce(
    (
      acc: Partial<QueryParams<QueryParamsSchema>>,
      queryParamsKey: keyof QueryParamsSchema
    ) => {
      if (queryParams.hasOwnProperty(queryParamsKey)) {
        acc[queryParamsKey] = queryParams[queryParamsKey as string];
      }
      return acc;
    },
    {}
  );
}
