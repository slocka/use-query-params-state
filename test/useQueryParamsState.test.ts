import { useState } from 'react';

import { expectType } from 'ts-expect';

import { createMemoryHistory, MemoryHistory } from 'history';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

import { getAppWrapper } from './getAppWrapper';

import {
  useQueryParamsState,
  QPARAMS,
  VALIDATORS,
  createUseQueryParamsStateHook,
} from '../src/index';

import { Errors } from '../src/errors';

let history: MemoryHistory;
let wrapper: React.ComponentType;

beforeEach(() => {
  history = createMemoryHistory();
  wrapper = getAppWrapper(history);
});

describe('Basic tests', () => {
  const queryParamsStateSchema = {
    booleanParam: QPARAMS.boolean(undefined, { allowNull: true }),
    stringParam: QPARAMS.string(),
    numberParam: QPARAMS.number(),
    arrayStringParam: QPARAMS.arrayOfStrings(),
    arrayNumberParam: QPARAMS.arrayOfNumbers(),
  };

  /**
   * Special test to verify that the TS types are correct.
   * This test will always return true at runtime but should
   * raise compile errors if TS types break.
   */
  test('Typescript types', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );
    const [params] = result.current;

    /** Verify the type of each param */
    expectType<boolean | null | undefined>(params.booleanParam);
    expectType<number | null | undefined>(params.numberParam);
    expectType<string | null | undefined>(params.stringParam);
    expectType<string[] | null | undefined>(params.arrayStringParam);
    expectType<number[] | null | undefined>(params.arrayNumberParam);

    act(() => {
      const setParams = result.current[1];

      /** Verify the TS type when setting a param*/
      try {
        setParams({
          // @ts-expect-error
          booleanParam: 'true',
          // @ts-expect-error
          stringParam: 4,
          // @ts-expect-error
          numberParam: '3',
          // @ts-expect-error
          arrayStringParam: [3, 'test'],
          // @ts-expect-error
          arrayNumberParam: ['3'],
        });
      } catch (err) {}

      /** Verify that setting param outside the schema will raise a TS error. */
      try {
        setParams({
          // @ts-expect-error
          inexistingParam: true,
        });
      } catch (err) {}
    });
  });

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

  test('It can apply updates with null values', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );

    act(() => {
      const setParams = result.current[1];
      setParams({
        numberParam: null,
      });
    });

    const [params] = result.current;

    expect(params.numberParam).toBe(null);
  });

  test('It can apply full updates with partial query params (reset of other query params)', () => {
    const url = '/test?booleanParam=true&stringParam=test&numberParam=0';

    history.push(url);

    const { result } = renderHook(
      () =>
        useQueryParamsState({
          booleanParam: QPARAMS.boolean(),
          stringParam: QPARAMS.string('default value'),
          numberParam: QPARAMS.number(),
        }),
      { wrapper }
    );

    const [paramsBeforeUpdate] = result.current;

    expect(paramsBeforeUpdate.numberParam).toBe(0);
    // All the other params should have been reset to their default value
    expect(paramsBeforeUpdate.booleanParam).toBe(true);
    expect(paramsBeforeUpdate.stringParam).toBe('test');

    act(() => {
      const setParams = result.current[1];
      setParams(
        {
          numberParam: 5,
        },
        false /** isPartialUpdate */
      );
    });

    const [paramsAfterUpdate] = result.current;

    expect(history.location.search).toEqual('?numberParam=5');
    expect(paramsAfterUpdate.numberParam).toEqual(5);
    // All the other params should have been reset to their default value
    expect(paramsAfterUpdate.booleanParam).toBeUndefined();
    expect(paramsAfterUpdate.stringParam).toEqual('default value');
  });

  test('It can reset all the params to their default value', () => {
    const url = '/test?booleanParam=true&stringParam=test&numberParam=0';

    history.push(url);

    const { result } = renderHook(
      () =>
        useQueryParamsState({
          booleanParam: QPARAMS.boolean(),
          stringParam: QPARAMS.string('default value'),
          numberParam: QPARAMS.number(),
        }),
      { wrapper }
    );

    const [paramsBeforeUpdate] = result.current;

    expect(paramsBeforeUpdate.numberParam).toBe(0);
    // All the other params should have been reset to their default value
    expect(paramsBeforeUpdate.booleanParam).toBe(true);
    expect(paramsBeforeUpdate.stringParam).toBe('test');

    act(() => {
      const setParams = result.current[1];
      // Complete reset
      setParams({}, false /** isPartialUpdate */);
    });

    const [paramsAfterUpdate] = result.current;

    expect(history.location.search).toEqual('?');
    expect(paramsAfterUpdate.numberParam).toBeUndefined();
    // All the other params should have been reset to their default value
    expect(paramsAfterUpdate.booleanParam).toBeUndefined();
    expect(paramsAfterUpdate.stringParam).toBe('default value');
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
          // @ts-ignore
          somethingNotInTheSchema: true,
        });
      }).toThrow(
        '"somethingNotInTheSchema" is not defined in queryParams Schema'
      );
    });
  });

  test('It throws an error if trying to update a param with the wrong type', () => {
    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );

    act(() => {
      const setParams = result.current[1];

      expect(() => {
        setParams({
          // @ts-expect-error
          booleanParam: 'true',
        });
      }).toThrow(
        /^booleanParam was expecting a boolean but received a string.$/
      );
    });
  });

  test('It should memoize the query params state object reference', () => {
    const url = '/test?booleanParam=true';
    history.push(url);

    const { result } = renderHook(
      () => {
        const [queryParams, setQueryParams] = useQueryParamsState(
          queryParamsStateSchema
        );
        const [testState, setTestState] = useState(false);

        return {
          setQueryParams: setQueryParams,
          queryParams: queryParams,
          setTestState: setTestState,
          testState: testState,
        };
      },
      { wrapper }
    );

    const { queryParams, testState } = result.current;
    act(() => {
      const { setTestState } = result.current;
      // Create a new re-render, queryParams ref should stay the same
      setTestState(true);
    });

    expect(result.current.testState).not.toBe(testState);
    expect(result.current.queryParams).toBe(queryParams);

    act(() => {
      const { setQueryParams } = result.current;
      // Update to the same value, this should not regenerate a new queryParams ref
      setQueryParams({ booleanParam: true });
    });

    expect(result.current.queryParams).toBe(queryParams);
  });
});

describe('With default value', () => {
  const queryParamsStateSchema = {
    booleanParam: QPARAMS.boolean(false),
    stringParam: QPARAMS.string('default'),
    numberParam: QPARAMS.number(6),
    arrayStringParam: QPARAMS.arrayOfStrings(['check', 'check']),
    arrayNumberParam: QPARAMS.arrayOfNumbers([]),
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
      numberParam: QPARAMS.number(() => dynamicValue),
      otherParam: QPARAMS.string(),
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
        selectedOption: QPARAMS.string(defaultFunction),
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
    stringParam: QPARAMS.string(),
    stringParamEncoded: QPARAMS.string(),
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
    expect(queryString).toContain('stringParam=Hello+World');

    expect(params.stringParamEncoded).toEqual('Hello%20World');
    expect(queryString).toContain('stringParamEncoded=Hello%2520World');
  });
});

describe('query param validators', () => {
  const lessThan10Validator = (stateValue: number) => {
    if (stateValue >= 10) {
      throw new Errors.QueryParamsValidationError('Invalid number');
    }
  };

  const lessThanXValidator = (
    stateValue: number,
    _parsedQueryParams: object,
    contextData: any
  ) => {
    if (stateValue >= contextData.max) {
      throw new Errors.QueryParamsValidationError('Invalid number');
    }
  };

  describe('When reading the state', () => {
    test('It should not touch the param if param is valid', () => {
      const queryParamsStateSchema = {
        numberParam: QPARAMS.number(6).validator(lessThan10Validator),
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
          numberParam: QPARAMS.number(0).validator(lessThanXValidator),
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
          numberParam: QPARAMS.number(6).validator(lessThan10Validator),
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
          numberParam: QPARAMS.number(defaultFn).validator(lessThan10Validator),
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
          stringParam: QPARAMS.string('default value').validator(
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
          stringParam: QPARAMS.string('default value').validator(
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
        numberParam: QPARAMS.number(6).validator(lessThan10Validator),
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
          numberParam: QPARAMS.number(0).validator(lessThanXValidator),
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
          numberParam: QPARAMS.number(6).validator(lessThan10Validator),
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
          numberParam: QPARAMS.number(defaultFn).validator(lessThan10Validator),
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
          stringParam: QPARAMS.string('default value').validator(
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
          stringParam: QPARAMS.string('default value').validator(
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
            })
          ).toThrow();
        });

        const [params] = result.current;
        expect(params.stringParam).toEqual('default value');

        const queryString = history.location.search;
        expect(queryString).toEqual('');
      });
    });
  });
});

describe('With other query params outside of the schema', () => {
  const queryParamsStateSchema = {
    booleanParam: QPARAMS.boolean(),
    stringParam: QPARAMS.string(),
  };
  test('It should not set them in the queryParamsState', () => {
    const url = '/test?booleanParam=true&stringParam=test&utm_source=Google';
    history.push(url);

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );

    const [params] = result.current;
    expect(params.booleanParam).toBe(true);
    expect(params.stringParam).toEqual('test');
    //@ts-expect-error
    expect(params.utm_source).toBeUndefined();
  });

  test("It doesn't remove query params outside the schema when making a partial update", () => {
    const url = '/test?booleanParam=true&stringParam=test&utm_source=Google';
    history.push(url);

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

    expect(history.location.search).toEqual(
      '?booleanParam=true&stringParam=hello&utm_source=Google'
    );
  });

  test("It doesn't remove query params outside the schema when making a full update", () => {
    const url = '/test?utm_source=Google&booleanParam=true&stringParam=test';
    history.push(url);

    const { result } = renderHook(
      () => useQueryParamsState(queryParamsStateSchema),
      { wrapper }
    );

    act(() => {
      const setParams = result.current[1];
      setParams(
        {
          stringParam: 'hello',
        },
        false /* Partial update */
      );
    });

    expect(history.location.search).toEqual(
      '?utm_source=Google&stringParam=hello'
    );
  });

  test("It doesn't remove the hash fragment during an update", () => {
    const url = '/test?booleanParam=true&stringParam=test#myId';
    history.push(url);

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

    expect(history.createHref(history.location)).toEqual(
      '/test?booleanParam=true&stringParam=hello#myId'
    );
  });
});
