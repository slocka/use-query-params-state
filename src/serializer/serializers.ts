import { isNumber, isNil } from '../lib';
import { ParamTypeToSerializerMap } from '../types';

const ARRAY_DELIMITER = ',';

const serializers: ParamTypeToSerializerMap = {
  ARRAY__STRINGS: {
    fromUrl(str?: string | null): Array<string> | null | undefined {
      if (isNil(str)) {
        return str;
      }

      if (str.length === 0) {
        return [];
      }

      return str.split(ARRAY_DELIMITER);
    },
    toUrl(array?: Array<string> | null): string | null | undefined {
      if (isNil(array)) {
        return array;
      }

      if (!Array.isArray(array)) {
        return undefined;
      }

      return array.join(ARRAY_DELIMITER);
    },
  },
  ARRAY__NUMBERS: {
    fromUrl(str?: string | null): Array<number> | null | undefined {
      if (isNil(str)) {
        return str;
      }

      if (str.length === 0) {
        return [];
      }

      return str.split(ARRAY_DELIMITER).map(Number);
    },
    toUrl(array?: Array<number> | null): string | null | undefined {
      if (isNil(array)) {
        return array;
      }

      if (!Array.isArray(array)) {
        return undefined;
      }

      return array.join(ARRAY_DELIMITER);
    },
  },
  STRING: {
    fromUrl: (str?: string | null): string | null | undefined => {
      return str;
    },
    toUrl: (str?: string | null): string | null | undefined => {
      if (isNil(str)) {
        return str;
      }

      if (typeof str !== 'string') {
        return undefined;
      }

      return str;
    },
  },
  BOOLEAN: {
    fromUrl: (str?: string | null): boolean | null | undefined => {
      if (isNil(str)) {
        return str;
      }

      if (str === 'true') {
        return true;
      }

      if (str === 'false') {
        return false;
      }

      // This is the scenario where we have `?flag`,
      // flag value is an empty string.
      if (str === '') {
        return true;
      }

      return undefined;
    },
    toUrl: (bool?: boolean | null): string | null | undefined => {
      if (isNil(bool)) {
        return bool;
      }

      if (typeof bool !== 'boolean') {
        return undefined;
      }

      return bool.toString();
    },
  },
  NUMBER: {
    fromUrl: (str?: string | null): number | null | undefined => {
      if (isNil(str)) {
        return str;
      }

      const number = parseFloat(str);
      return !Number.isNaN(number) ? number : undefined;
    },
    toUrl: (number?: number | null): string | null | undefined => {
      if (isNil(number)) {
        return number;
      }

      return isNumber(number) ? number.toString() : undefined;
    },
  },
};

export default serializers;
