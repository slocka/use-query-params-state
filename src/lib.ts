import { queryParamsConfig, NormalizedQueryParamsConfig } from 'types';
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

export function normalizeConfig(
  config: queryParamsConfig
): NormalizedQueryParamsConfig {
  return Object.keys(config).reduce((acc, propKey) => {
    let { type } = config[propKey];
    if (!type) {
      type = serializers.STRING;
    }
    acc[propKey] = {
      ...config[propKey],
      type,
    };

    return acc;
  }, {} as NormalizedQueryParamsConfig);
}
