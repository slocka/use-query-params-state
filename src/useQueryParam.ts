import { useCallback } from 'react';

import { QueryParamDef } from './queryParamDef';

import { useQueryParamsState } from './useQueryParamsState';
import { QPARAMS } from './qparams';

export function useQueryParam(
  paramName: string,
  queryParamDef: QueryParamDef<any> = QPARAMS.string()
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
