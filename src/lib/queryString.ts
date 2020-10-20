import { isUndefined } from './typeChecking';

export function parseQueryString(
  string: string
): Record<string, string | null> {
  const searchParams = new URLSearchParams(string);
  let rawQueryParams: Record<string, any> = {};

  for (const param of searchParams) {
    const [key, value] = param;
    if (value === 'null') {
      rawQueryParams[key] = null;
    } else {
      rawQueryParams[key] = value;
    }
  }

  return rawQueryParams;
}

export function createQueryString(queryParams: Record<string, any>) {
  const searchParams = new URLSearchParams();

  Object.keys(queryParams).forEach(queryParamKey => {
    const queryParamValue = queryParams[queryParamKey];
    if (queryParamValue === null) {
      searchParams.append(queryParamKey, 'null');
    } else if (!isUndefined(queryParamValue)) {
      // we only want to add params that are not undefined
      searchParams.append(queryParamKey, queryParamValue);
    }
  });

  return searchParams.toString();
}
