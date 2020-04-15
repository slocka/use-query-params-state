import { createMemoryHistory, MemoryHistory } from 'history';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { getAppWrapper } from './getAppWrapper';

import {
  createTypedQueryParamsHook,
  defineProp,
  URL_PARSERS,
} from '../src/index';

let history: MemoryHistory;
let wrapper: React.ComponentType;
beforeEach(() => {
  history = createMemoryHistory();
  wrapper = getAppWrapper(history);
});

describe('Basic tests', () => {
  const queryParamsStateConfig = {
    booleanParam: defineProp(URL_PARSERS.BOOLEAN),
    stringParam: defineProp(URL_PARSERS.STRING),
    numberParam: defineProp(URL_PARSERS.NUMBER),
    arrayStringParam: defineProp(URL_PARSERS.ARRAY__STRINGS),
    arrayNumberParam: defineProp(URL_PARSERS.ARRAY__NUMBERS),
  };
  const useQueryParamsState = createTypedQueryParamsHook(
    queryParamsStateConfig
  );

  test('It initialize with the state from the URL', () => {
    const url =
      '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';

    history.push(url);

    const { result } = renderHook(() => useQueryParamsState(), { wrapper });
    const [params] = result.current;
    expect(params.booleanParam).toBe(true);
    expect(params.stringParam).toEqual('test');
    expect(params.numberParam).toEqual(0);
    expect(params.arrayStringParam).toEqual(['one', 'two', 'three']);
    expect(params.arrayNumberParam).toEqual([1, 2, 3]);
  });

  test('It updates the URL with the correct value', () => {
    const { result } = renderHook(() => useQueryParamsState(), { wrapper });
    act(() => {
      const setParams = result.current[1];
      setParams({
        booleanParam: false,
        stringParam: 'testUpdated',
        numberParam: 1,
        arrayStringParam: ['one', 'two'],
        arrayNumberParam: [1, 2],
      });
    });

    const [params] = result.current;
    const queryString = history.location.search;

    expect(params.booleanParam).toBe(false);
    expect(queryString).toContain('booleanParam=false');

    expect(params.stringParam).toEqual('testUpdated');
    expect(queryString).toContain('stringParam=testUpdated');

    expect(params.numberParam).toBe(1);
    expect(queryString).toContain('numberParam=1');

    expect(params.arrayStringParam).toEqual(['one', 'two']);
    expect(queryString).toContain('arrayStringParam=one%2Ctwo');

    expect(params.arrayNumberParam).toEqual([1, 2]);
    expect(queryString).toContain('arrayNumberParam=1%2C2');
  });
});

describe('With default value', () => {
  const queryParamsStateConfig = {
    booleanParam: defineProp(URL_PARSERS.BOOLEAN, { defaultValue: false }),
    stringParam: defineProp(URL_PARSERS.STRING, { defaultValue: 'default' }),
    numberParam: defineProp(URL_PARSERS.NUMBER, { defaultValue: 6 }),
    arrayStringParam: defineProp(URL_PARSERS.ARRAY__STRINGS, {
      defaultValue: ['check', 'check'],
    }),
    arrayNumberParam: defineProp(URL_PARSERS.ARRAY__NUMBERS, {
      defaultValue: [],
    }),
  };
  const useQueryParamsState = createTypedQueryParamsHook(
    queryParamsStateConfig
  );

  test('It should use the default value if param is not defined in the URL', () => {
    const { result } = renderHook(() => useQueryParamsState(), { wrapper });
    const [params] = result.current;
    expect(params.booleanParam).toBe(false);
    expect(params.stringParam).toEqual('default');
    expect(params.numberParam).toEqual(6);
    expect(params.arrayStringParam).toEqual(['check', 'check']);
    expect(params.arrayNumberParam).toEqual([]);
  });

  test('It should overwrite the default value if param is in the URL', () => {
    const url =
      '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';
    history.push(url);

    const { result } = renderHook(() => useQueryParamsState(), { wrapper });
    const [params] = result.current;
    expect(params.booleanParam).toBe(true);
    expect(params.stringParam).toEqual('test');
    expect(params.numberParam).toEqual(0);
    expect(params.arrayStringParam).toEqual(['one', 'two', 'three']);
    expect(params.arrayNumberParam).toEqual([1, 2, 3]);
  });
});

describe('Others', () => {
  const queryParamsStateConfig = {
    stringParam: defineProp(URL_PARSERS.STRING),
    stringParamEncoded: defineProp(URL_PARSERS.STRING),
  };
  const useQueryParamsState = createTypedQueryParamsHook(
    queryParamsStateConfig
  );

  test("It shouldn't not interpret commas in params of type STRING as array separator.", () => {
    const url =
      '/test?stringParam=hello,world&stringParamEncoded=hello%2Cworld';

    history.push(url);

    const { result } = renderHook(() => useQueryParamsState(), { wrapper });
    const [params] = result.current;
    expect(params.stringParam).toEqual('hello,world');
    expect(params.stringParamEncoded).toEqual('hello,world');
  });

  test('It should double encode string with encoded values', () => {
    const { result } = renderHook(() => useQueryParamsState(), { wrapper });
    act(() => {
      const setParams = result.current[1];
      setParams({
        stringParam: 'Hello World',
        stringParamEncoded: 'Hello%20World',
      });
    });

    const [params] = result.current;
    const queryString = history.location.search;

    expect(params.stringParam).toEqual('Hello World');
    expect(queryString).toContain('stringParam=Hello%20World');

    expect(params.stringParamEncoded).toEqual('Hello%20World');
    expect(queryString).toContain('stringParamEncoded=Hello%2520World');
  });
});

describe('With default value', () => {});

// test("It returns a default value")

// test("It validates URL state")

// test("It can use a custom serializer")
