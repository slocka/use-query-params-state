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

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

/**
 * Returns true if null or undefined
 */
export function isNil(value: any): value is undefined | null {
  return isUndefined(value) || value === null;
}
