import { isNumber } from './utils';

export const parsers = {
  ARRAY__STRINGS: {
    toUrl(array?: Array<string> | null): string | undefined {
      return array ? array.join(',') : undefined;
    },
    fromUrl(str: string): Array<string> | null {
      if (typeof str === 'undefined') {
        return null;
      }

      return str ? str.split(',') : [];
    },
  },
  ARRAY__NUMBERS: {
    toUrl(array?: Array<number> | null): string | undefined {
      return array ? array.join(',') : undefined;
    },
    fromUrl(str: string): Array<number> | null {
      if (typeof str === 'undefined') {
        return null;
      }

      return str ? str.split(',').map(Number) : [];
    },
  },
  STRING: {
    toUrl: (str: string): string => str,
    fromUrl: (str?: string): string | null =>
      typeof str !== 'undefined' ? str : null,
  },
  BOOLEAN: {
    toUrl: (bool: boolean): string => bool.toString(),
    fromUrl: (str?: string): boolean | undefined =>
      typeof str !== 'undefined' ? str === 'true' : undefined,
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
