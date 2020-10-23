import React from 'react';
import { createMemoryHistory, MemoryHistory } from 'history';
import { render, fireEvent } from '@testing-library/react';

import {
  QPARAMS,
  withQueryParamsState,
  withQueryParamsProps,
} from '../src/index';
import { getAppWrapper } from './getAppWrapper';

let history: MemoryHistory;
let wrapper: React.ComponentType;

beforeEach(() => {
  history = createMemoryHistory();
  wrapper = getAppWrapper(history);
});

describe('withQueryParams', () => {
  const queryParamsStateSchema = {
    booleanParam: QPARAMS.boolean(),
    stringParam: QPARAMS.string('default value'),
    numberParam: QPARAMS.number(6),
    arrayStringParam: QPARAMS.arrayOfStrings(),
    arrayNumberParam: QPARAMS.arrayOfNumbers(),
  };
  type QueryParamsSchema = typeof queryParamsStateSchema;

  /**
   * Because of the type of tests test-library forces you o write,
   * to test withQueryParamsState we use a WrappedComponent that displays the query params
   * as text so we can then check its value using .toHaveTextContent().
   */
  const WrappedComponent: React.FC<withQueryParamsProps<QueryParamsSchema>> = ({
    queryParams,
    setQueryParams,
  }) => {
    const onClick = () => {
      setQueryParams({ numberParam: 3, stringParam: 'new value' });
    };

    return (
      <div>
        <div data-testid="string-param"> {queryParams.stringParam}</div>
        <div data-testid="number-param"> {queryParams.numberParam}</div>
        <button data-testid="button" onClick={onClick}>
          update
        </button>
      </div>
    );
  };

  it('Should inject the queryParams prop', () => {
    const TestedComponent = withQueryParamsState(queryParamsStateSchema)(
      WrappedComponent
    );
    const { getByTestId } = render(<TestedComponent />, {
      wrapper,
    });

    expect(getByTestId('string-param')).toHaveTextContent(/^default value$/);
    expect(getByTestId('number-param')).toHaveTextContent(/^6$/);
  });

  it('Should inject the setQueryParams prop', () => {
    const TestedComponent = withQueryParamsState(queryParamsStateSchema)(
      WrappedComponent
    );
    const { getByTestId } = render(<TestedComponent />, {
      wrapper,
    });

    fireEvent.click(getByTestId('button'));

    expect(getByTestId('string-param')).toHaveTextContent(/^new value$/);
    expect(getByTestId('number-param')).toHaveTextContent(/^3$/);
  });
});
