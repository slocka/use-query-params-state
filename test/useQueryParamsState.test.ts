import { createMemoryHistory, MemoryHistory } from 'history';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

import { getAppWrapper } from './getAppWrapper';

import {
  useQueryParamsState,
  defineProp,
  URL_PARSERS,
  paramValidators,
} from '../src/index';
import { QueryParamsValidationError } from '../src/errors';

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

  test('It initialize with the state from the URL', () => {
    const url =
      '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';

    history.push(url);

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );
    const [params] = result.current;
    expect(params.booleanParam).toBe(true);
    expect(params.stringParam).toEqual('test');
    expect(params.numberParam).toEqual(0);
    expect(params.arrayStringParam).toEqual(['one', 'two', 'three']);
    expect(params.arrayNumberParam).toEqual([1, 2, 3]);
  });

  test('It updates the URL with the correct value', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );
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

  test('It can apply partial updates', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );

    act(() => {
      const setParams = result.current[1];
      setParams({
        numberParam: 5,
      });
    });

    act(() => {
      const setParams = result.current[1];
      setParams({
        arrayStringParam: ['one', 'two'],
      });
    });

    const [params] = result.current;
    const queryString = history.location.search;

    expect(params.numberParam).toEqual(5);
    expect(queryString).toContain('numberParam=5');
    expect(params.arrayStringParam).toEqual(['one', 'two']);
    expect(queryString).toContain('arrayStringParam=one%2Ctwo');
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

  test('It should use the default value if param is not defined in the URL', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );
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

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );
    const [params] = result.current;
    expect(params.booleanParam).toBe(true);
    expect(params.stringParam).toEqual('test');
    expect(params.numberParam).toEqual(0);
    expect(params.arrayStringParam).toEqual(['one', 'two', 'three']);
    expect(params.arrayNumberParam).toEqual([1, 2, 3]);
  });

  test('It should allow defaultValue to be a function', () => {
    let dynamicValue = 1;
    const queryParamsStateConfig = {
      numberParam: defineProp(URL_PARSERS.NUMBER, {
        defaultValue: () => dynamicValue,
      }),
      otherParam: defineProp(URL_PARSERS.STRING),
    };

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );
    const [params] = result.current;
    expect(params.numberParam).toEqual(1);

    // Update the value, next render should default numberParam to this new value
    dynamicValue = 2;

    // Trigger a re-render
    act(() => {
      const setParams = result.current[1];
      setParams({
        otherParam: 'something new',
      });
    });

    const [paramsAfterUpdate] = result.current;
    expect(paramsAfterUpdate.numberParam).toEqual(2);
  });
});

describe('Serializer', () => {
  const queryParamsStateConfig = {
    stringParam: defineProp(URL_PARSERS.STRING),
    stringParamEncoded: defineProp(URL_PARSERS.STRING),
  };

  test("It shouldn't not interpret commas in params of type STRING as array separator.", () => {
    const url =
      '/test?stringParam=hello,world&stringParamEncoded=hello%2Cworld';

    history.push(url);

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );
    const [params] = result.current;
    expect(params.stringParam).toEqual('hello,world');
    expect(params.stringParamEncoded).toEqual('hello,world');
  });

  test('It should double encode string with encoded values', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateConfig),
      { wrapper }
    );
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

describe('query param validators', () => {
  const lessThan10Validator = (stateValue: any) => {
    if (stateValue >= 10) {
      throw new QueryParamsValidationError('Invalid number');
    }
  };

  describe('When reading the state', () => {
    test('It should not touch the param if param is valid', () => {
      const queryParamsStateConfig = {
        numberParam: defineProp(URL_PARSERS.NUMBER, {
          defaultValue: 6,
          validator: lessThan10Validator,
        }),
      };

      const url = '/test?numberParam=9';

      history.push(url);

      const { result } = renderHook(
        () => useQueryParamsState(queryParamsStateConfig),
        { wrapper }
      );
      const [params] = result.current;
      expect(params.numberParam).toEqual(9);
    });

    test('It should use the default state if param is invalid', () => {
      const queryParamsStateConfig = {
        numberParam: defineProp(URL_PARSERS.NUMBER, {
          defaultValue: 6,
          validator: lessThan10Validator,
        }),
      };

      const url = '/test?numberParam=12';

      history.push(url);

      const { result } = renderHook(
        () => useQueryParamsState(queryParamsStateConfig),
        { wrapper }
      );
      const [params] = result.current;
      expect(params.numberParam).toEqual(6);
    });

    describe('With predefined validators', () => {
      test('It should not touch the state if value is oneOf(..)', () => {
        const queryParamsStateConfig = {
          stringParam: defineProp(URL_PARSERS.STRING, {
            defaultValue: 'default value',
            validator: paramValidators.oneOf(['default value', 'hello']),
          }),
        };

        const url = '/test?stringParam=hello';

        history.push(url);

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateConfig),
          { wrapper }
        );
        const [params] = result.current;
        expect(params.stringParam).toEqual('hello');
      });

      test('It should default the state if value is not oneOf(..)', () => {
        const queryParamsStateConfig = {
          stringParam: defineProp(URL_PARSERS.STRING, {
            defaultValue: 'default value',
            validator: paramValidators.oneOf(['default value', 'hello']),
          }),
        };

        const url = '/test?stringParam=world';

        history.push(url);

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateConfig),
          { wrapper }
        );
        const [params] = result.current;
        expect(params.stringParam).toEqual('default value');
      });
    });
  });

  describe('When writing the state', () => {
    test('It update param if param is valid', () => {
      const queryParamsStateConfig = {
        numberParam: defineProp(URL_PARSERS.NUMBER, {
          defaultValue: 6,
          validator: lessThan10Validator,
        }),
      };

      const { result } = renderHook(
        () => useQueryParamsState(queryParamsStateConfig),
        { wrapper }
      );

      act(() => {
        const setParams = result.current[1];
        setParams({
          numberParam: 5,
        });
      });

      const [params] = result.current;
      expect(params.numberParam).toEqual(5);

      const queryString = history.location.search;
      expect(queryString).toContain('numberParam=5');
    });

    test('It should use the default state if param is invalid', () => {
      const queryParamsStateConfig = {
        numberParam: defineProp(URL_PARSERS.NUMBER, {
          defaultValue: 6,
          validator: lessThan10Validator,
        }),
      };

      const { result } = renderHook(
        () => useQueryParamsState(queryParamsStateConfig),
        { wrapper }
      );
      act(() => {
        const setParams = result.current[1];
        expect(() => {
          setParams({
            numberParam: 10,
          });
        }).toThrow();
      });

      const [params] = result.current;
      expect(params.numberParam).toEqual(6);

      const queryString = history.location.search;
      console.log('queryString', queryString);
      expect(queryString).toEqual('');
    });

    describe('With predefined validators', () => {
      test('It should set the state if value is oneOf(..)', () => {
        const queryParamsStateConfig = {
          stringParam: defineProp(URL_PARSERS.STRING, {
            defaultValue: 'default value',
            validator: paramValidators.oneOf(['default value', 'hello']),
          }),
        };

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateConfig),
          { wrapper }
        );

        act(() => {
          const setParams = result.current[1];
          setParams({
            stringParam: 'hello',
          });
        });

        const [params] = result.current;
        expect(params.stringParam).toEqual('hello');

        const queryString = history.location.search;
        expect(queryString).toContain('stringParam=hello');
      });

      test('It should default the state if value is not oneOf(..)', () => {
        const queryParamsStateConfig = {
          stringParam: defineProp(URL_PARSERS.STRING, {
            defaultValue: 'default value',
            validator: paramValidators.oneOf(['default value', 'hello']),
          }),
        };

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateConfig),
          { wrapper }
        );

        act(() => {
          const setParams = result.current[1];
          expect(() =>
            setParams({
              stringParam: 'world',
            }).toThrow()
          );
        });

        const [params] = result.current;
        expect(params.stringParam).toEqual('default value');

        const queryString = history.location.search;
        expect(queryString).toEqual('');
      });
    });
  });
});

// test("It can use a custom serializer")
