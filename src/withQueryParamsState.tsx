import React from 'react';

import {
  IQueryParamsSchema,
  QueryParams,
  QueryParamsSetter,
  QueryStringBuilderFunction,
} from './types';

import { useQueryParamsState } from './useQueryParamsState';
import { useBuildQueryString } from './useBuildQueryString';

export type withQueryParamsProps<T extends IQueryParamsSchema> = {
  queryParams: QueryParams<T>;
  setQueryParams: QueryParamsSetter<T>;
  buildQueryString: QueryStringBuilderFunction<T>;
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
      const buildQueryString = useBuildQueryString(queryParamsSchema);

      return (
        <WrappedComponent
          {...props}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          buildQueryString={buildQueryString}
        />
      );
    };

    return Component;
  };
}
