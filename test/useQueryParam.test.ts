import { expectType, TypeEqual } from 'ts-expect';

import { createMemoryHistory, MemoryHistory } from 'history';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

import { getAppWrapper } from './getAppWrapper';

import { useQueryParam, QPARAMS } from '../src/index';
import { Errors } from '../src/errors';

let history: MemoryHistory;
let wrapper: React.ComponentType;

beforeEach(() => {
  history = createMemoryHistory();
  wrapper = getAppWrapper(history);
});

describe('Basic tests', () => {
  /**
   * Special test to verify that the TS types are correct.
   * This test will always return true at runtime but should
   * raise compile errors if TS types break.
   */
  test('Typescript types', () => {
    const { result } = renderHook(
      () => useQueryParam('booleanParam', QPARAMS.boolean()),
      {
        wrapper,
      }
    );
    const [booleanParam] = result.current;

    /** Verify the type of the param */
    expectType<TypeEqual<boolean | null | undefined, typeof booleanParam>>(
      true
    );

    act(() => {
      const setParam = result.current[1];

      /** Verify the TS type when setting a param*/
      try {
        // @ts-expect-error
        setParam('true');
      } catch (err) {}
    });
  });

  test('It initialize with the state from the URL', () => {
    const url =
      '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';

    history.push(url);

    const { result } = renderHook(
      () => useQueryParam('booleanParam', QPARAMS.boolean()),
      { wrapper }
    );
    const [booleanParam] = result.current;

    expect(booleanParam).toBe(true);
  });

  test('It updates the URL with the correct value', () => {
    const { result } = renderHook(
      () => useQueryParam('stringParam', QPARAMS.string()),
      { wrapper }
    );
    act(() => {
      const setStringParam = result.current[1];
      setStringParam('testUpdated');
    });

    const [stringParam] = result.current;
    const queryString = history.location.search;

    expect(stringParam).toEqual('testUpdated');
    expect(queryString).toContain('stringParam=testUpdated');
  });

  test('It should allow to not specify the param type', () => {
    const url = '/test?stringParam=test';

    history.push(url);

    const { result } = renderHook(() => useQueryParam('stringParam'), {
      wrapper,
    });
    const [booleanParam] = result.current;

    expect(booleanParam).toEqual('test');
  });
});

describe('With default value', () => {
  test('It should use the default value if param is not defined in the URL', () => {
    const { result } = renderHook(
      () =>
        useQueryParam(
          'arrayStringParam',
          QPARAMS.arrayOfStrings(['check', 'check'])
        ),
      { wrapper }
    );
    const [arrayStringParam] = result.current;
    expect(arrayStringParam).toEqual(['check', 'check']);
  });

  test('It should overwrite the default value if param is in the URL', () => {
    const url = '/test?arrayNumberParam=1,2,3';
    history.push(url);

    const { result } = renderHook(
      () => useQueryParam('arrayNumberParam', QPARAMS.arrayOfNumbers([])),
      { wrapper }
    );
    const [arrayNumberParam] = result.current;
    expect(arrayNumberParam).toEqual([1, 2, 3]);
  });

  test('It should allow defaultValue to be a function', () => {
    let dynamicValue = 1;

    const { result } = renderHook(
      () =>
        useQueryParam(
          'numberParam',
          QPARAMS.number(() => dynamicValue)
        ),
      { wrapper }
    );

    const { result: resultOtherParam } = renderHook(
      () => useQueryParam('otherParam', QPARAMS.string()),
      { wrapper }
    );

    const [numberParam] = result.current;
    expect(numberParam).toEqual(1);

    // Update the value, next render should default numberParam to this new value
    dynamicValue = 2;

    // Trigger a re-render by updating using the other param
    act(() => {
      const setOtherParam = resultOtherParam.current[1];
      setOtherParam('something new');
    });

    const [numberParamAfterUpdate] = result.current;
    expect(numberParamAfterUpdate).toEqual(2);
  });
});

describe('With validator function', () => {
  const lessThan10Validator = (stateValue: any) => {
    if (stateValue >= 10) {
      throw new Errors.QueryParamsValidationError('Invalid number');
    }
  };

  test('It should not touch the param if param is valid', () => {
    const url = '/test?numberParam=9';

    history.push(url);

    const { result } = renderHook(
      () =>
        useQueryParam(
          'numberParam',
          QPARAMS.number(6).validator(lessThan10Validator)
        ),
      { wrapper }
    );
    const [numberParam] = result.current;
    expect(numberParam).toEqual(9);
  });

  test('It should use the default state if param is invalid', () => {
    const url = '/test?numberParam=12';

    history.push(url);

    const { result } = renderHook(
      () =>
        useQueryParam(
          'numberParam',
          QPARAMS.number(6).validator(lessThan10Validator)
        ),
      { wrapper }
    );
    const [numberParam] = result.current;
    expect(numberParam).toEqual(6);
  });
});
