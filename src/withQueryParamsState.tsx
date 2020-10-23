import React from 'react';

import { IQueryParamsSchema, QueryParams, QueryParamsSetter } from './types';

import { useQueryParamsState } from './useQueryParamsState';

export type withQueryParamsProps<T extends IQueryParamsSchema> = {
  queryParams: QueryParams<T>;
  setQueryParams: QueryParamsSetter<T>;
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

      return (
        <WrappedComponent
          {...props}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
      );
    };

    return Component;
  };
}
