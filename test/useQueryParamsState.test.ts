import { createMemoryHistory, MemoryHistory } from 'history';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

import { getAppWrapper } from './getAppWrapper';

import {
  useQueryParamsState,
  QPARAM,
  VALIDATORS,
  createUseQueryParamsStateHook,
} from '../src/index';
import { QueryParamsValidationError } from '../src/errors';

let history: MemoryHistory;
let wrapper: React.ComponentType;

beforeEach(() => {
  history = createMemoryHistory();
  wrapper = getAppWrapper(history);
});

describe('Basic tests', () => {
  const queryParamsStateSchema = {
    booleanParam: QPARAM.boolean(),
    stringParam: QPARAM.string(),
    numberParam: QPARAM.number(),
    arrayStringParam: QPARAM.arrayOfStrings(),
    arrayNumberParam: QPARAM.arrayOfNumbers(),
  };

  test('It initializes with the state from the URL', () => {
    const url =
      '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';

    history.push(url);

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
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
      () => useQueryParamsState(queryParamsStateSchema),
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
      () => useQueryParamsState(queryParamsStateSchema),
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

  test('It throws an error if trying to update a param that is not part of the schema', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );

    act(() => {
      const setParams = result.current[1];

      expect(() => {
        setParams({
          booleanParam: false,
          somethingNotInTheSchema: true,
        });
      }).toThrow(
        '"somethingNotInTheSchema" is not defined in queryParams Schema'
      );
    });
  });

  test.skip("It doesn't change the query params reference", () => {});
});

describe('With default value', () => {
  const queryParamsStateSchema = {
    booleanParam: QPARAM.boolean(false),
    stringParam: QPARAM.string('default'),
    numberParam: QPARAM.number(6),
    arrayStringParam: QPARAM.arrayOfStrings(['check', 'check']),
    arrayNumberParam: QPARAM.arrayOfNumbers([]),
  };

  test('It should use the default value if param is not defined in the URL', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );
    const [params] = result.current;
    expect(params.booleanParam).toBe(false);
    expect(params.stringParam).toEqual('default');
    expect(params.numberParam).toEqual(6);
    expect(params.arrayStringParam).toEqual(['check', 'check']);
    expect(params.arrayNumberParam).toEqual([]);
  });

  test('It should not overwrite the default value if param is in the URL', () => {
    const url =
      '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';
    history.push(url);

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
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
    const queryParamsStateSchema = {
      numberParam: QPARAM.number(() => dynamicValue),
      otherParam: QPARAM.string(),
    };

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
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

  describe('Using context data', () => {
    let useMyQueryParams: (contextData?: any) => any[];
    // Emulated hook created somewhere where contextData is not available.
    beforeAll(() => {
      const defaultFunction = (contextData: any): string => {
        return contextData.availableOptions[0];
      };

      const queryParamsStateSchema = {
        selectedOption: QPARAM.string(defaultFunction),
      };
      useMyQueryParams = createUseQueryParamsStateHook(queryParamsStateSchema);
    });

    // Component using hook can provide context data that will be used in the default function.
    test('It should allow to access context data in default function', () => {
      const contextData = {
        availableOptions: ['Option B', 'Option E'],
      };

      const { result } = renderHook(() => useMyQueryParams(contextData), {
        wrapper,
      });

      const [params] = result.current;
      expect(params.selectedOption).toEqual('Option B');
    });
  });
});

describe('Serializer', () => {
  const queryParamsStateSchema = {
    stringParam: QPARAM.string(),
    stringParamEncoded: QPARAM.string(),
  };

  test("It shouldn't not interpret commas in params of type STRING as array separator.", () => {
    const url =
      '/test?stringParam=hello,world&stringParamEncoded=hello%2Cworld';

    history.push(url);

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );
    const [params] = result.current;
    expect(params.stringParam).toEqual('hello,world');
    expect(params.stringParamEncoded).toEqual('hello,world');
  });

  test('It should double encode string with encoded values', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
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
  const lessThan10Validator = (stateValue: number) => {
    if (stateValue >= 10) {
      throw new QueryParamsValidationError('Invalid number');
    }
  };

  const lessThanXValidator = (
    stateValue: number,
    _parsedQueryParams: object,
    contextData: any
  ) => {
    if (stateValue >= contextData.max) {
      throw new QueryParamsValidationError('Invalid number');
    }
  };

  describe('When reading the state', () => {
    test('It should not touch the param if param is valid', () => {
      const queryParamsStateSchema = {
        numberParam: QPARAM.number(6).validator(lessThan10Validator),
      };

      const url = '/test?numberParam=9';

      history.push(url);

      const { result } = renderHook(
        () => useQueryParamsState(queryParamsStateSchema),
        { wrapper }
      );
      const [params] = result.current;
      expect(params.numberParam).toEqual(9);
    });

    describe('When invalid', () => {
      test('It should have access to context data in validator function', () => {
        const queryParamsStateSchema = {
          numberParam: QPARAM.number(0).validator(lessThanXValidator),
        };

        const url = '/test?numberParam=9';

        history.push(url);

        const contextData = { max: 5 };
        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema, contextData),
          { wrapper }
        );
        const [params] = result.current;
        expect(params.numberParam).toEqual(0);
      });

      test('It should use the default state when default is a value', () => {
        const queryParamsStateSchema = {
          numberParam: QPARAM.number(6).validator(lessThan10Validator),
        };

        const url = '/test?numberParam=12';

        history.push(url);

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema),
          { wrapper }
        );
        const [params] = result.current;
        expect(params.numberParam).toEqual(6);
      });

      test('It should use the default state when default is a function using context data', () => {
        const defaultFn = (contextData: any) => contextData.defaultNumber;
        const queryParamsStateSchema = {
          numberParam: QPARAM.number(defaultFn).validator(lessThan10Validator),
        };

        const url = '/test?numberParam=12';

        history.push(url);

        const contextData = {
          defaultNumber: 2,
        };
        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema, contextData),
          { wrapper }
        );
        const [params] = result.current;
        expect(params.numberParam).toEqual(2);
      });
    });

    describe('With predefined validators', () => {
      test('It should not touch the state if value is oneOf(..)', () => {
        const queryParamsStateSchema = {
          stringParam: QPARAM.string('default value').validator(
            VALIDATORS.oneOf(['default value', 'hello'])
          ),
        };

        const url = '/test?stringParam=hello';

        history.push(url);

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema),
          { wrapper }
        );
        const [params] = result.current;
        expect(params.stringParam).toEqual('hello');
      });

      test('It should default the state if value is not oneOf(..)', () => {
        const queryParamsStateSchema = {
          stringParam: QPARAM.string('default value').validator(
            VALIDATORS.oneOf(['default value', 'hello'])
          ),
        };

        const url = '/test?stringParam=world';

        history.push(url);

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema),
          { wrapper }
        );
        const [params] = result.current;
        expect(params.stringParam).toEqual('default value');
      });
    });
  });

  describe('When writing the state', () => {
    test('It update param if param is valid', () => {
      const queryParamsStateSchema = {
        numberParam: QPARAM.number(6).validator(lessThan10Validator),
      };

      const { result } = renderHook(
        () => useQueryParamsState(queryParamsStateSchema),
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

    describe('When invalid', () => {
      test('It should have access to context data in validator function', () => {
        const queryParamsStateSchema = {
          numberParam: QPARAM.number(0).validator(lessThanXValidator),
        };

        const contextData = { max: 5 };
        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema, contextData),
          { wrapper }
        );
        act(() => {
          const setParams = result.current[1];
          expect(() => {
            setParams({
              numberParam: 9,
            });
          }).toThrow();
        });
      });

      test('It should use the default state when default is a value', () => {
        const queryParamsStateSchema = {
          numberParam: QPARAM.number(6).validator(lessThan10Validator),
        };

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema),
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
        expect(queryString).toEqual('');
      });

      test('It should use the default state when default is a function using context data', () => {
        const defaultFn = (contextData: any) => contextData.defaultNumber;

        const queryParamsStateSchema = {
          numberParam: QPARAM.number(defaultFn).validator(lessThan10Validator),
        };

        const contextData = {
          defaultNumber: 2,
        };

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema, contextData),
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
        expect(params.numberParam).toEqual(2);

        const queryString = history.location.search;
        expect(queryString).toEqual('');
      });
    });

    describe('With predefined validators', () => {
      test('It should set the state if value is oneOf(..)', () => {
        const queryParamsStateSchema = {
          stringParam: QPARAM.string('default value').validator(
            VALIDATORS.oneOf(['default value', 'hello'])
          ),
        };

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema),
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
        const queryParamsStateSchema = {
          stringParam: QPARAM.string('default value').validator(
            VALIDATORS.oneOf(['default value', 'hello'])
          ),
        };

        const { result } = renderHook(
          () => useQueryParamsState(queryParamsStateSchema),
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
