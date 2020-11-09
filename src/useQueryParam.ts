import { useCallback } from 'react';
import { QPARAMS } from './qparams';

import { QueryParamDef } from './queryParamDef';

import { useQueryParamsState } from './useQueryParamsState';

/**
 * Create function overload to handle the default value queryParamDef = QPARAMS.string()
 * as typescript doesn't seem to allow "queryParamDef: QueryParamDef<T> = QPARAMS.string()"
 */
export function useQueryParam(
  paramName: string,
  queryParamDef?: undefined,
  contextData?: any
): [string | null | undefined, (value?: string | null | undefined) => void];

export function useQueryParam<T>(
  paramName: string,
  queryParamDef: QueryParamDef<T>,
  contextData?: any
): [T | null | undefined, (value?: T | null | undefined) => void];

export function useQueryParam(
  paramName: string,
  queryParamDef: QueryParamDef<any> = QPARAMS.string(),
  contextData?: any
): [any | null | undefined, (value?: any | null | undefined) => void] {
  const [params, setParams] = useQueryParamsState(
    {
      [paramName]: queryParamDef,
    },
    contextData
  );

  const setSingleParam = useCallback(
    (value?: any | null) => {
      setParams({ [paramName]: value });
    },
    [setParams, paramName]
  );
  const queryParam = params[paramName];

  return [queryParam, setSingleParam];
}
