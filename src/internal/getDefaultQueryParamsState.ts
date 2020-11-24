import { IQueryParamsStateSchema, QueryParamsState } from '../types';

/**
 * @internal
 */
export function getDefaultQueryParamsState<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamsSchema: QueryParamsSchema,
  contextData?: any
): QueryParamsState<QueryParamsSchema> {
  return Object.keys(queryParamsSchema).reduce(
    (acc, queryParamKey: keyof QueryParamsSchema) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      acc[queryParamKey] = queryParamDef.getDefaultValue(contextData);
      return acc;
    },
    {} as QueryParamsState<QueryParamsSchema>
  );
}
