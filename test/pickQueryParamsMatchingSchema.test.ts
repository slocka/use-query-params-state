import { pickQueryParamsMatchingSchema } from '../src/index';
import { QPARAMS } from '../src/index';

const queryParamsStateSchema = {
  booleanParam: QPARAMS.boolean(undefined, { allowUndefined: true }),
  stringParam: QPARAMS.string(undefined, { allowUndefined: true }),
};

describe('pickQueryParamsMatchingSchema', () => {
  test('It returns an empty object if no queryParams provided', () => {
    // @ts-expect-error
    expect(pickQueryParamsMatchingSchema(queryParamsStateSchema)).toEqual({});
  });

  test('It returns the full object if all params matches', () => {
    expect(
      pickQueryParamsMatchingSchema(queryParamsStateSchema, {
        booleanParam: true,
        stringParam: 'hello',
      })
    ).toEqual({
      booleanParam: true,
      stringParam: 'hello',
    });
  });

  test('It returns an empty object if nothing matches', () => {
    expect(
      pickQueryParamsMatchingSchema(queryParamsStateSchema, {
        paramNotMatchingSchema: true,
      })
    ).toEqual({});
  });

  test('It returns a partial object containing the matching params', () => {
    expect(
      pickQueryParamsMatchingSchema(queryParamsStateSchema, {
        paramNotMatchingSchema: true,
        stringParam: 'hello',
      })
    ).toEqual({
      stringParam: 'hello',
    });
  });

  /** This helper function does not care about type validation */
  test('It should not care about the actual type of the field', () => {
    expect(
      pickQueryParamsMatchingSchema(queryParamsStateSchema, {
        booleanParam: 'not a boolean',
        stringParam: 3,
      })
    ).toEqual({
      booleanParam: 'not a boolean',
      stringParam: 3,
    });
  });
});
