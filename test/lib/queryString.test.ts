import { parseQueryString, createQueryString } from '../../src/lib';

describe('QueryString', () => {
  describe('parseQueryString', () => {
    test('It should parse everything as a string', () => {
      expect(
        parseQueryString('string=hello world&number=8&boolean=true')
      ).toEqual({
        string: 'hello world',
        number: '8',
        boolean: 'true',
      });
    });

    test('It should parse "null" as null instead of a string', () => {
      expect(parseQueryString('test=null')).toEqual({
        test: null,
      });
    });

    test('It should parse empty string value as an empty string', () => {
      expect(parseQueryString('test=')).toEqual({
        test: '',
      });
    });

    test('It should parse params without value as empty string', () => {
      expect(parseQueryString('name=test&flag')).toEqual({
        name: 'test',
        flag: '',
      });
    });

    test('It should decode the string', () => {
      expect(parseQueryString('test=hello+world%2F%40')).toEqual({
        test: 'hello world/@',
      });
    });

    test('It should return an empty object if no query sting', () => {
      expect(parseQueryString('')).toEqual({});
    });
  });

  describe('createQueryString', () => {
    test('It should create everything as a string', () => {
      expect(
        createQueryString({
          string: 'hello_world',
          number: 8,
          boolean: true,
        })
      ).toBe('string=hello_world&number=8&boolean=true');
    });

    test('It should create "null" as string for null values', () => {
      expect(createQueryString({ test: null })).toBe('test=null');
    });

    test('It should create param without value when a empty string', () => {
      expect(
        createQueryString({
          test: '',
        })
      ).toEqual('test=');
    });

    test('It should encode the string', () => {
      expect(createQueryString({ test: 'hello world/@' })).toBe(
        'test=hello+world%2F%40'
      );
    });

    test('It should return an empty object if no query sting', () => {
      expect(createQueryString({})).toBe('');
    });
  });
});
