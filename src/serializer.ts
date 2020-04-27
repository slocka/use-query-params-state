import { isUndefined, isFunction } from './utils';
import { TypedQueryParamsConfig, KeyObject } from './types';

/**
 * Parse each individual query params with the parser provided for each prop
 * in the config. If provided, use the default value when the parser returns
 * null or undefined. This function does not validate each prop, it only converts it
 * from a string to the right type.
 * @param config
 * @param queryParams - Raw query params extracted from the URL but not parsed.
 */
export function deserializeQueryParamsValues(
  config: TypedQueryParamsConfig,
  queryParams: KeyObject
): object {
  return Object.keys(config).reduce((acc, propKey) => {
    const { parser, defaultValue } = config[propKey];
    let value = parser.fromUrl(queryParams[propKey]);
    acc[propKey] =
      !isUndefined(value) && value !== null
        ? value
        : getDefaultValue(defaultValue);

    return acc;
  }, {} as KeyObject);
}

export function serializeQueryParamsValues(
  config: TypedQueryParamsConfig,
  queryParams: KeyObject
): object {
  return Object.keys(queryParams).reduce((acc, propKey) => {
    const { parser } = config[propKey];
    let value = parser.toUrl(queryParams[propKey]);
    if (!isUndefined(value)) {
      acc[propKey] = value;
    }

    return acc;
  }, {} as KeyObject);
}

/**
 * TODO: For the moment, there is no much point of using a default value as a function
 * as we are not passing any runtime props yet.
 * This can still be useful if we want to get the default based on the latest
 * value in local storage for example.
 * @param defaultValue
 */
function getDefaultValue(defaultValue: any): any {
  if (isFunction(defaultValue)) {
    return defaultValue();
  }

  return defaultValue;
}
