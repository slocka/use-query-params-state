import { useCallback } from 'react';

import { QueryParamDef } from './queryParamDef';

import { useQueryParamsState } from './useQueryParamsState';
import { QPARAM } from './qparam';

export function useQueryParam(
  paramName: string,
  queryParamDef: QueryParamDef<any> = QPARAM.string()
) {
  const [params, setParams] = useQueryParamsState({
    [paramName]: queryParamDef,
  });

  const setParam = useCallback(
    value => {
      setParams({ [paramName]: value });
    },
    [setParams, paramName]
  );

  return [params[paramName], setParam];
}
