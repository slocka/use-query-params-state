import serializers from '../src/internal/serializer/serializers';

import { Serializer } from '../src/types';

describe('String serializer', () => {
  describe('fromUrl', () => {
    test('It should decode the value as a string', () => {
      expect(serializers.STRING.fromUrl('hello')).toBe('hello');
    });

    test('It should decode the empty string as a string', () => {
      expect(serializers.STRING.fromUrl('')).toBe('');
    });

    test('It should decode the a stringify number as a string', () => {
      expect(serializers.STRING.fromUrl('12')).toBe('12');
      expect(serializers.STRING.fromUrl('true')).toBe('true');
    });
  });

  describe('toUrl', () => {
    test('It should encode the value as a string', () => {
      expect(serializers.STRING.toUrl('hello')).toBe('hello');
    });

    test('It should encode the empty string as a string', () => {
      expect(serializers.STRING.toUrl('')).toBe('');
    });

    test('It should throw an error when encoding invalid input', () => {
      // @ts-expect-error
      expect(() => serializers.STRING.toUrl(3)).toThrow(
        /^was expecting a string but received a number.$/
      );
      // @ts-expect-error
      expect(() => serializers.STRING.toUrl(false)).toThrow(
        /^was expecting a string but received a boolean.$/
      );
    });
  });
});

describe('Boolean serializer', () => {
  describe('fromUrl', () => {
    test('It should decode the "true" as a boolean', () => {
      expect(serializers.BOOLEAN.fromUrl('true')).toBe(true);
    });

    test('It should decode the "false" as a boolean', () => {
      expect(serializers.BOOLEAN.fromUrl('false')).toBe(false);
    });

    /** This is the scenario where we have `?flag`, flag value is an empty string */
    test('It should decode the empty string as true', () => {
      expect(serializers.BOOLEAN.fromUrl('')).toBe(true);
    });

    test('It should decode invalid boolean values as undefined', () => {
      expect(serializers.BOOLEAN.fromUrl('something')).toBe(undefined);
    });

    test('It should decode falsy values as undefined', () => {
      expect(serializers.BOOLEAN.fromUrl('0')).toBe(undefined);
    });
  });

  describe('toUrl', () => {
    test('It should encode the true value as a string', () => {
      expect(serializers.BOOLEAN.toUrl(true)).toBe('true');
    });

    test('It should encode the false value as a string', () => {
      expect(serializers.BOOLEAN.toUrl(false)).toBe('false');
    });

    test('It should throw an error when encoding invalid input', () => {
      // @ts-expect-error
      expect(() => serializers.BOOLEAN.toUrl('true')).toThrow(
        /^was expecting a boolean but received a string.$/
      );
      // @ts-expect-error
      expect(() => serializers.BOOLEAN.toUrl('something')).toThrow(
        /^was expecting a boolean but received a string.$/
      );
      // @ts-expect-error
      expect(() => serializers.BOOLEAN.toUrl('')).toThrow(
        /^was expecting a boolean but received a string.$/
      );
      // @ts-expect-error
      expect(() => serializers.BOOLEAN.toUrl(0)).toThrow(
        /^was expecting a boolean but received a number.$/
      );
    });
  });
});

describe('Number serializer', () => {
  describe('fromUrl', () => {
    test('It should decode the string value as a number', () => {
      expect(serializers.NUMBER.fromUrl('1303')).toBe(1303);
      expect(serializers.NUMBER.fromUrl('0')).toBe(0);
    });

    test('It should decode the string value as a float number', () => {
      expect(serializers.NUMBER.fromUrl('1.03903')).toBe(1.03903);
    });

    test('It should decode the string value as a negative float number', () => {
      expect(serializers.NUMBER.fromUrl('-1.03903')).toBe(-1.03903);
    });

    test('It should decode the empty string', () => {
      expect(serializers.NUMBER.fromUrl('')).toBe(undefined);
    });

    test('It should decode an invalid string as undefined', () => {
      expect(serializers.NUMBER.fromUrl('az')).toBe(undefined);
    });

    /**
     * @TODO: Find a way to make this test pass as parseFloat("6hello") returns 6.
     */
    test.skip('It should decode an invalid string as undefined', () => {
      expect(serializers.NUMBER.fromUrl('6hello')).toBe(undefined);
    });
  });

  describe('toUrl', () => {
    test('It should encode an integer as a string', () => {
      expect(serializers.NUMBER.toUrl(0)).toEqual('0');
      expect(serializers.NUMBER.toUrl(120)).toEqual('120');
    });

    test('It should encode a float number as a string', () => {
      expect(serializers.NUMBER.toUrl(30.30043013101)).toBe('30.30043013101');
    });

    test('It should encode a negative float number as a string', () => {
      expect(serializers.NUMBER.toUrl(-30.30043013101)).toBe('-30.30043013101');
    });

    test('It should throw an error when encoding invalid input', () => {
      // @ts-expect-error
      expect(() => serializers.NUMBER.toUrl('something')).toThrow(
        /^was expecting a number but received a string.$/
      );
      // @ts-expect-error
      expect(() => serializers.NUMBER.toUrl('6')).toThrow(
        /^was expecting a number but received a string.$/
      );
    });
  });
});

describe('Array string serializer', () => {
  describe('fromUrl', () => {
    test('It should decode the value as an array of strings', () => {
      expect(
        serializers.ARRAY__STRINGS.fromUrl('hello,this is a test,8,true,,,{}')
      ).toStrictEqual(['hello', 'this is a test', '8', 'true', '', '', '{}']);
    });

    test('It should decode the empty string as an empty array', () => {
      expect(serializers.ARRAY__STRINGS.fromUrl('')).toStrictEqual([]);
    });
  });

  describe('toUrl', () => {
    test('It should encode the value as a array', () => {
      expect(
        serializers.ARRAY__STRINGS.toUrl([
          'hello',
          'this is a test',
          '8',
          'true',
          '',
          '',
          '{}',
        ])
      ).toBe('hello,this is a test,8,true,,,{}');
    });

    test('It should encode the empty array as an empty string', () => {
      expect(serializers.ARRAY__STRINGS.toUrl([])).toBe('');
    });

    test('It should throw an error when encoding invalid input', () => {
      // @ts-expect-error
      expect(() => serializers.ARRAY__STRINGS.toUrl(3)).toThrow(
        /^was expecting an array but received a number.$/
      );
      // @ts-expect-error
      expect(() => serializers.ARRAY__STRINGS.toUrl(false)).toThrow(
        /^was expecting an array but received a boolean.$/
      );
    });

    /**
     * @TODO: Decide what should be the behavior of this scenario.
     */
    test('It should encode array of invalid types as string', () => {
      // @ts-expect-error
      expect(serializers.ARRAY__STRINGS.toUrl([3, false, 'hello'])).toBe(
        '3,false,hello'
      );
    });
  });
});

describe('Array number serializer', () => {
  describe('fromUrl', () => {
    test('It should decode the value as an array of numbers', () => {
      expect(
        serializers.ARRAY__NUMBERS.fromUrl('10,-3,0.903003,0,-0.3133')
      ).toStrictEqual([10, -3, 0.903003, 0, -0.3133]);
    });

    test('It should decode the empty string as an empty array', () => {
      expect(serializers.ARRAY__NUMBERS.fromUrl('')).toStrictEqual([]);
    });

    /**
     * @TODO: Decide what should be the behavior of this scenario.
     */
    test('It should decode an array containing invalid numbers', () => {
      expect(
        serializers.ARRAY__NUMBERS.fromUrl('3,false,hello')
      ).toStrictEqual([3, NaN, NaN]);
    });
  });

  describe('toUrl', () => {
    test('It should encode the value as a array', () => {
      expect(
        serializers.ARRAY__NUMBERS.toUrl([10, -3, 0.903003, 0, -0.3133])
      ).toBe('10,-3,0.903003,0,-0.3133');
    });

    test('It should encode the empty array as an empty string', () => {
      expect(serializers.ARRAY__NUMBERS.toUrl([])).toBe('');
    });

    test('It should throw an error when encoding invalid input', () => {
      // @ts-expect-error
      expect(() => serializers.ARRAY__NUMBERS.toUrl(3)).toThrow(
        /^was expecting an array but received a number.$/
      );
      // @ts-expect-error
      expect(() => serializers.ARRAY__NUMBERS.toUrl(false)).toThrow(
        /^was expecting an array but received a boolean.$/
      );
      // @ts-expect-error
      expect(() => serializers.ARRAY__NUMBERS.toUrl('[]')).toThrow(
        /^was expecting an array but received a string.$/
      );
    });

    /**
     * @TODO: Decide what should be the behavior of this scenario.
     */
    test('It should encode array of invalid types as string', () => {
      // @ts-expect-error
      expect(serializers.ARRAY__NUMBERS.toUrl([3, false, 'hello'])).toBe(
        '3,false,hello'
      );
    });
  });
});

/** All serializers should be able to handle undefined and null values. */
describe('Handling of undefined and null values', () => {
  const serializerList: Array<[string, Serializer<any>]> = Object.keys(
    serializers
  ).map(serializerType => {
    return [
      serializerType,
      serializers[serializerType as keyof typeof serializers],
    ];
  });

  describe.each(serializerList)('%s', (_serializerType, serializer) => {
    describe('fromUrl', () => {
      test('It should return undefined when undefined.', () => {
        expect(serializer.fromUrl(undefined)).toBe(undefined);
      });

      test('It should return null when null.', () => {
        expect(serializer.fromUrl(null)).toBe(null);
      });
    });

    describe('toUrl', () => {
      test('It should return undefined when undefined', () => {
        expect(serializer.toUrl(undefined)).toBe(undefined);
      });

      test('It should return null when null', () => {
        expect(serializer.toUrl(null)).toBe(null);
      });
    });
  });
});
