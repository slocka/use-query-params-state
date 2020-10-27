import { createMemoryHistory, MemoryHistory } from 'history';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

import { getAppWrapper } from './getAppWrapper';

import { useBuildQueryString, QPARAMS, QS_BUILD_STRATEGY } from '../src/index';

let history: MemoryHistory;
let wrapper: React.ComponentType;

beforeEach(() => {
  history = createMemoryHistory();
  wrapper = getAppWrapper(history);
});

describe('Basic functionalities', () => {
  const queryParamsStateSchema = {
    booleanParam: QPARAMS.boolean(),
    stringParam: QPARAMS.string(),
    numberParam: QPARAMS.number(),
    arrayStringParam: QPARAMS.arrayOfStrings(),
    arrayNumberParam: QPARAMS.arrayOfNumbers(),
  };

  test('The hook should return a function', () => {
    const { result } = renderHook(
      () => useBuildQueryString(queryParamsStateSchema),
      { wrapper }
    );

    const buildQueryString = result.current;

    expect(typeof buildQueryString).toBe('function');
  });

  test('It should throw an error if query params does not exist', () => {
    const { result } = renderHook(
      () => useBuildQueryString(queryParamsStateSchema),
      { wrapper }
    );

    const buildQueryString = result.current;

    expect(() =>
      // @ts-expect-error
      buildQueryString({ test: false })
    ).toThrow(
      '"test" is not defined in queryParams Schema. Defined query params are: ["booleanParam","stringParam","numberParam","arrayStringParam","arrayNumberParam"]'
    );
  });

  test('It should throw an error if query params is of the wrong type', () => {
    const { result } = renderHook(
      () => useBuildQueryString(queryParamsStateSchema),
      { wrapper }
    );

    const buildQueryString = result.current;

    expect(() => buildQueryString({ booleanParam: 'false' })).toThrow(
      'booleanParam was expecting a boolean but received a string.'
    );
  });

  describe('With "NEW" build stratgy', () => {
    test('The build function should build with the "NEW" strategy by default', () => {
      const url =
        '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(buildQueryString({ booleanParam: false })).toEqual(
        'booleanParam=false'
      );
    });

    test('It should ignore all existing params', () => {
      const url =
        '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString({ booleanParam: false }, QS_BUILD_STRATEGY.NEW)
      ).toEqual('booleanParam=false');
    });

    test('It should ignore external params', () => {
      const url = '/test?utm_source=Google';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString({ booleanParam: false }, QS_BUILD_STRATEGY.NEW)
      ).toEqual('booleanParam=false');
    });
  });

  describe('With "PRESERVE_CURRENT_ALL" build strategy ', () => {
    test('It should keep all the current params', () => {
      const url =
        '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString({}, QS_BUILD_STRATEGY.PRESERVE_CURRENT_ALL)
      ).toEqual(
        // Comma array separator is automatically encoded.
        'booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one%2Ctwo%2Cthree&arrayNumberParam=1%2C2%2C3'
      );
    });

    test('It should keep all the current params and apply new ones', () => {
      const url =
        '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString(
          { stringParam: 'hello', numberParam: 6 },
          QS_BUILD_STRATEGY.PRESERVE_CURRENT_ALL
        )
      ).toEqual(
        // Comma array separator is automatically encoded.
        'booleanParam=true&stringParam=hello&numberParam=6&arrayStringParam=one%2Ctwo%2Cthree&arrayNumberParam=1%2C2%2C3'
      );
    });

    test('It should also keep external params and apply new ones', () => {
      const url = '/test?booleanParam=true&stringParam=test&utm_source=Google';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString(
          { stringParam: 'hello', numberParam: 6 },
          QS_BUILD_STRATEGY.PRESERVE_CURRENT_ALL
        )
      ).toEqual(
        // Comma array separator is automatically encoded.
        'booleanParam=true&stringParam=hello&utm_source=Google&numberParam=6'
      );
    });
  });

  describe('With "PRESERVE_CURRENT_EXTERNAL" build strategy ', () => {
    test('It should keep only the external params', () => {
      const url =
        '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3&utm_source=Google';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString({}, QS_BUILD_STRATEGY.PRESERVE_CURRENT_EXTERNAL)
      ).toEqual('utm_source=Google');
    });

    test('It should keep only external params and apply new ones', () => {
      const url =
        '/test?booleanParam=true&stringParam=test&numberParam=0&arrayStringParam=one,two,three&arrayNumberParam=1,2,3&utm_source=Google';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString(
          { stringParam: 'hello', numberParam: 6 },
          QS_BUILD_STRATEGY.PRESERVE_CURRENT_EXTERNAL
        )
      ).toEqual('utm_source=Google&stringParam=hello&numberParam=6');
    });
  });

  describe('With "PRESERVE_CURRENT_ALL_WITH_DEFAULT" build strategy ', () => {
    const queryParamsStateSchema = {
      booleanParam: QPARAMS.boolean(false),
      stringParam: QPARAMS.string('default'),
      numberParam: QPARAMS.number(),
      arrayStringParam: QPARAMS.arrayOfStrings(),
      arrayNumberParam: QPARAMS.arrayOfNumbers(),
    };

    test('It should keep all params with their default value', () => {
      const url =
        '/test?arrayStringParam=one,two,three&arrayNumberParam=1,2,3&utm_source=Google';
      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString(
          {},
          QS_BUILD_STRATEGY.PRESERVE_CURRENT_ALL_WITH_DEFAULT
        )
      ).toEqual(
        'booleanParam=false&stringParam=default&arrayStringParam=one%2Ctwo%2Cthree&arrayNumberParam=1%2C2%2C3&utm_source=Google'
      );
    });

    test('It should keep all params with their default value and apply new ones', () => {
      const url = '/test?numberParam=6&utm_source=Google';

      history.push(url);

      const { result } = renderHook(
        () => useBuildQueryString(queryParamsStateSchema),
        { wrapper }
      );

      const buildQueryString = result.current;

      expect(
        buildQueryString(
          { booleanParam: true },
          QS_BUILD_STRATEGY.PRESERVE_CURRENT_ALL_WITH_DEFAULT
        )
      ).toEqual(
        'booleanParam=true&stringParam=default&numberParam=6&utm_source=Google'
      );
    });
  });
});
