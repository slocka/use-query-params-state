import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { getRawQueryParamsInSchemaFromURL, buildQueryString } from './helpers';
import {
  IQueryParamsSchema,
  QS_BUILD_STRATEGY,
  QueryParams,
  QueryParamsSetter,
  RawQueryParams,
} from './types';

import { deserializeQueryParamsValues } from './serializer/serialize';

import { runParamsValidators } from './validators';

export function useQueryParamsState<
  QueryParamsSchema extends IQueryParamsSchema
>(
  queryParamsSchema: QueryParamsSchema,
  contextData?: any
): [QueryParams<QueryParamsSchema>, QueryParamsSetter<QueryParamsSchema>] {
  const rawQueryParams = useRawQueryParamsFromUrl(queryParamsSchema);

  // Convert queryParams values from string to the type defined for each query param.
  const queryParams = deserializeQueryParamsValues(
    queryParamsSchema,
    rawQueryParams,
    contextData
  );

  const parsedQueryParamsHash = JSON.stringify(queryParams);
  // Keep the same object reference as long as the hash stays the same.
  // We could have used rawQueryParams instead of the hash of parsedQueryParams,
  // but we want to ignore other query strings params.
  const queryParamsState = useMemo(() => {
    // Validate each prop if a validator function has been provided.
    return runParamsValidators(queryParamsSchema, queryParams, contextData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedQueryParamsHash, queryParamsSchema]);

  const setQueryParamsState = useSetQueryParamsState(
    queryParamsSchema,
    contextData
  );

  return [queryParamsState, setQueryParamsState];
}

/**
 * Extract parameters from query string and return
 * the ones that are contained in the schema in the shape
 * of a key/value object.
 * The current implementation is tight to React-router.
 */
function useRawQueryParamsFromUrl<QueryParamsSchema extends IQueryParamsSchema>(
  schema: QueryParamsSchema
): Partial<RawQueryParams<QueryParamsSchema>> {
  const location = useLocation();
  const queryStringParams = getRawQueryParamsInSchemaFromURL(location, schema);

  return queryStringParams;
}

function useSetQueryParamsState<QueryParamsSchema extends IQueryParamsSchema>(
  queryParamsSchema: QueryParamsSchema,
  contextData?: any
): QueryParamsSetter<QueryParamsSchema> {
  const history = useHistory();
  const location = useLocation();

  return useCallback(
    (newQueryParams, isPartialUpdate = true) => {
      const newQueryString = buildQueryString(
        location,
        queryParamsSchema,
        newQueryParams,
        isPartialUpdate
          ? QS_BUILD_STRATEGY.PRESERVE_CURRENT_ALL
          : QS_BUILD_STRATEGY.PRESERVE_CURRENT_EXTERNAL,
        contextData
      );
      const newLocation = {
        ...location,
        search: `?${newQueryString}`,
      };

      history.push(newLocation);
    },
    [history, location, queryParamsSchema, contextData]
  );
}
