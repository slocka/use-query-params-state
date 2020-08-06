import { createMemoryHistory, MemoryHistory } from 'history';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

import { getAppWrapper } from './getAppWrapper';

import { useQueryParam, PARAM_TYPES } from '../src/index';
import { QueryParamsValidationError } from '../src/errors';

let history: MemoryHistory;
let wrapper: React.ComponentType;

beforeEach(() => {
  history = createMemoryHistory();
  wrapper = getAppWrapper(history);
});

describe('Basic tests', () => {
  test('It initialize with the state from the URL', () => {
    const url =
      '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';

    history.push(url);

    const { result } = renderHook(
      () => useQueryParam('booleanParam', PARAM_TYPES.BOOLEAN),
      { wrapper }
    );
    const [booleanParam] = result.current;

    expect(booleanParam).toBe(true);
  });

  test('It updates the URL with the correct value', () => {
    const { result } = renderHook(
      () => useQueryParam('stringParam', PARAM_TYPES.STRING),
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
        useQueryParam('arrayStringParam', PARAM_TYPES.ARRAY__STRINGS, [
          'check',
          'check',
        ]),
      { wrapper }
    );
    const [arrayStringParam] = result.current;
    expect(arrayStringParam).toEqual(['check', 'check']);
  });

  test('It should overwrite the default value if param is in the URL', () => {
    const url = '/test?arrayNumberParam=1,2,3';
    history.push(url);

    const { result } = renderHook(
      () => useQueryParam('arrayNumberParam', PARAM_TYPES.ARRAY__NUMBERS, []),
      { wrapper }
    );
    const [arrayNumberParam] = result.current;
    expect(arrayNumberParam).toEqual([1, 2, 3]);
  });

  test('It should allow defaultValue to be a function', () => {
    let dynamicValue = 1;

    const { result } = renderHook(
      () =>
        useQueryParam('numberParam', PARAM_TYPES.NUMBER, () => dynamicValue),
      { wrapper }
    );

    const { result: resultOtherParam } = renderHook(
      () => useQueryParam('otherParam', PARAM_TYPES.STRING),
      { wrapper }
    );

    const [numberParam] = result.current;
    expect(numberParam).toEqual(1);

    // Update the value, next render should default numberParam to this new value
    dynamicValue = 2;

    // Trigger a re-render by updating using the other param
    act(() => {
      const setOtherParam = resultOtherParam.current[1];
      setOtherParam({
        otherParam: 'something new',
      });
    });

    const [numberParamAfterUpdate] = result.current;
    expect(numberParamAfterUpdate).toEqual(2);
  });
});

describe('With validator function', () => {
  const lessThan10Validator = (stateValue: any) => {
    if (stateValue >= 10) {
      throw new QueryParamsValidationError('Invalid number');
    }
  };

  test('It should not touch the param if param is valid', () => {
    const url = '/test?numberParam=9';

    history.push(url);

    const { result } = renderHook(
      () =>
        useQueryParam(
          'numberParam',
          PARAM_TYPES.NUMBER,
          6,
          lessThan10Validator
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
          PARAM_TYPES.NUMBER,
          6,
          lessThan10Validator
        ),
      { wrapper }
    );
    const [numberParam] = result.current;
    expect(numberParam).toEqual(6);
  });
});
