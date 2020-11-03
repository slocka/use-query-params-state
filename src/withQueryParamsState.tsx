import React from 'react';

import {
  IQueryParamsSchema,
  QueryParams,
  QueryParamsSetter,
  QueryStringBuilderFunction,
} from './types';

import { useQueryParamsState } from './useQueryParamsState';
import { useBuildQueryStringFromCurrentURL } from './useBuildQueryStringFromCurrentURL';

export type withQueryParamsProps<T extends IQueryParamsSchema> = {
  queryParams: QueryParams<T>;
  setQueryParams: QueryParamsSetter<T>;
  buildQueryStringFromCurrentURL: QueryStringBuilderFunction<T>;
};

export function withQueryParamsState<
  QueryParamsSchema extends IQueryParamsSchema,
  Props
>(queryParamsSchema: QueryParamsSchema) {
  return (
    WrappedComponent: React.ComponentType<
      withQueryParamsProps<QueryParamsSchema> & Props
    >
  ) => {
    const Component: React.FC<Props> = props => {
      const [queryParams, setQueryParams] = useQueryParamsState(
        queryParamsSchema
      );
      const buildQueryStringFromCurrentURL = useBuildQueryStringFromCurrentURL(
        queryParamsSchema
      );

      return (
        <WrappedComponent
          {...props}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          buildQueryStringFromCurrentURL={buildQueryStringFromCurrentURL}
        />
      );
    };

    return Component;
  };
}
