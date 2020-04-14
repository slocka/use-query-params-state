import { isNumber } from './utils';

export const parsers = {
  ARRAY__STRINGS: {
    toUrl(array?: Array<string>): string | null {
      return array ? array.join(',') : null;
    },
    fromUrl(str: string): Array<string> | null {
      return str ? str.split(',') : null;
    },
  },
  ARRAY__NUMBERS: {
    toUrl(array?: Array<number>): string | null {
      return array ? array.join(',') : null;
    },
    fromUrl(str: string): Array<number> | null {
      return str ? str.split(',').map(Number) : null;
    },
  },
  STRING: {
    toUrl: (str: string): string => str,
    fromUrl: (str?: string): string | null =>
      typeof str !== 'undefined' ? str : null,
  },
  BOOLEAN: {
    toUrl: (bool: boolean): string => bool.toString(),
    fromUrl: (str?: string): boolean | null =>
      typeof str !== 'undefined' ? str === 'true' : null,
  },
  NUMBER: {
    toUrl: (number: number): string => {
      return isNumber(number) ? number.toString() : '';
    },
    fromUrl: (str?: string): number | null => {
      if (typeof str === 'undefined') {
        return null;
      }
      const number = parseFloat(str);

      return !Number.isNaN(number) ? number : null;
    },
  },
};
