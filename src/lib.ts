import { QueryParamsConfig, QueryParamsNormalizedConfig } from 'types';
import serializers from './serializer/serializers';

export function isFunction(fn: any): boolean {
  /*
   * Safari 9 has a bug that returns typeof `object` for a function.
   * Using `Object#toString` and retrieve to object class avoids that issue
   * https://github.com/lodash/lodash/blob/master/isFunction.js
   * There are several issues raised for this in the "old" underscore lib,
   * one of them is this one https://github.com/jashkenas/underscore/issues/1929
   */
  return Object.prototype.toString.call(fn) === '[object Function]';
}

export function isUndefined(obj: any): boolean {
  return typeof obj === 'undefined';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number';
}

/**
 * Make the "type" prop of each param option mandatory
 * (Default to string if not specified)
 * @param config
 */
export function normalizeConfig(
  config: QueryParamsConfig
): QueryParamsNormalizedConfig {
  return Object.keys(config).reduce((acc, propKey) => {
    let paramOptions = config[propKey];
    const type = !paramOptions.type ? serializers.STRING : paramOptions.type;
    acc[propKey] = {
      ...config[propKey],
      type,
    };

    return acc;
  }, {} as QueryParamsNormalizedConfig);
}
