import { useCallback, useMemo } from 'react';
import { createQueryString } from './lib';
import { useHistory, useLocation } from 'react-router-dom';
import {
  getAllRawQueryParamsFromURL,
  getRawQueryParamsInSchemaFromURL,
  getExternalQueryParamsFromURL,
} from './helpers';
import {
  IQueryParamsSchema,
  QueryParams,
  QueryParamsSetter,
  RawQueryParams,
} from './types';

import {
  serializeQueryParamsValues,
  deserializeQueryParamsValues,
} from './serializer/serialize';

import { runParamsValidators, runParamsValidatorsPartial } from './validators';

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
  const allRawQueryParams = getAllRawQueryParamsFromURL(location);
  const externalQueryParams = getExternalQueryParamsFromURL(
    location,
    queryParamsSchema
  );

  return useCallback(
    (newQueryParams, isPartialUpdate = true) => {
      const rawQueryParamsMergeDestination = isPartialUpdate
        ? { ...allRawQueryParams }
        : { ...externalQueryParams };

      // Raise a JS error if we are trying to set a value that doesn't pass the validator
      runParamsValidatorsPartial(
        queryParamsSchema,
        newQueryParams,
        contextData,
        /** throwOnError */ true
      );

      const serializedQueryParams = {
        ...rawQueryParamsMergeDestination,
        ...serializeQueryParamsValues(queryParamsSchema, newQueryParams),
      };

      const newQueryString = createQueryString(serializedQueryParams);

      const newLocation = {
        ...location,
        search: `?${newQueryString}`,
      };

      history.push(newLocation);
    },
    [
      history,
      location,
      allRawQueryParams,
      externalQueryParams,
      queryParamsSchema,
      contextData,
    ]
  );
}
