import { isNumber } from '../lib';
import { ParamTypeToSerializerMap } from '../types';

const serializers: ParamTypeToSerializerMap = {
  ARRAY__STRINGS: {
    toUrl(array?: Array<string> | null): string | null | undefined {
      if (typeof array === 'undefined' || array === null) {
        return array;
      }

      return array.join(',');
    },
    fromUrl(str?: string | null): Array<string> | null | undefined {
      if (typeof str === 'undefined' || str === null) {
        return str;
      }

      return str.split(',');
    },
  },
  ARRAY__NUMBERS: {
    toUrl(array?: Array<number> | null): string | null | undefined {
      if (typeof array === 'undefined' || array === null) {
        return array;
      }

      return array.join(',');
    },
    fromUrl(str?: string | null): Array<number> | null | undefined {
      if (typeof str === 'undefined' || str === null) {
        return str;
      }

      return str.split(',').map(Number);
    },
  },
  STRING: {
    toUrl: (str?: string | null): string | null | undefined => {
      return str;
    },
    fromUrl: (str?: string | null): string | null | undefined => {
      return str;
    },
  },
  BOOLEAN: {
    toUrl: (bool?: boolean | null): string | null | undefined => {
      if (typeof bool === 'undefined' || bool === null) {
        return bool;
      }

      return bool.toString();
    },
    fromUrl: (str?: string | null): boolean | null | undefined => {
      if (typeof str === 'undefined' || str === null) {
        return str;
      }

      return str === 'true';
    },
  },
  NUMBER: {
    toUrl: (number?: number | null): string | null | undefined => {
      if (typeof number === 'undefined' || number === null) {
        return number;
      }

      return isNumber(number) ? number.toString() : undefined;
    },
    fromUrl: (str?: string | null): number | null | undefined => {
      if (typeof str === 'undefined' || str === null) {
        return str;
      }

      const number = parseFloat(str);
      return !Number.isNaN(number) ? number : undefined;
    },
  },
};

export default serializers;
