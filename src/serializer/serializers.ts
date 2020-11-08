import { isNumber, isNil } from '../lib';
import { ScalarTypeToSerializerMap } from '../types';
import { QueryParamsUpdateError } from '../errors';

const ARRAY_DELIMITER = ',';

const serializers: ScalarTypeToSerializerMap = {
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
        throw new QueryParamsUpdateError(
          `was expecting an array but received a ${typeof array}.`
        );
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
        throw new QueryParamsUpdateError(
          `was expecting an array but received a ${typeof array}.`
        );
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
        throw new QueryParamsUpdateError(
          `was expecting a string but received a ${typeof str}.`
        );
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
        throw new QueryParamsUpdateError(
          `was expecting a boolean but received a ${typeof bool}.`
        );
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

      if (!isNumber(number)) {
        throw new QueryParamsUpdateError(
          `was expecting a number but received a ${typeof number}.`
        );
      }

      return number.toString();
    },
  },
};

export default serializers;
