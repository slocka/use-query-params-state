import { buildQueryString } from '../src/index';
import { QPARAMS } from '../src/index';

describe('buildQueryString', () => {
  test('It creates a new query string', () => {
    const queryParamsStateSchema = {
      booleanParam: QPARAMS.boolean(),
      stringParam: QPARAMS.string(),
    };

    const queryString = buildQueryString(queryParamsStateSchema, {
      stringParam: 'value',
      booleanParam: false,
    });
    expect(queryString).toEqual('stringParam=value&booleanParam=false');
  });

  test('It creates a new query string with partial params ', () => {
    const schema = {
      search: QPARAMS.string(),
      minRating: QPARAMS.number(0),
      sortBy: QPARAMS.string('price'),
    };

    const queryString = buildQueryString(schema, {
      search: 'sport shoes',
      sortBy: 'rating',
    });

    expect(queryString).toEqual('search=sport+shoes&sortBy=rating');
  });

  test('It throws an error if param does not exist', () => {
    const schema = {
      search: QPARAMS.string(),
      minRating: QPARAMS.number(0),
      sortBy: QPARAMS.string('price'),
    };

    expect(() => {
      buildQueryString(schema, {
        search: 'sport shoes',
        // @ts-expect-error
        unknown: 'unknown',
      });
    }).toThrow(
      '"unknown" is not defined in queryParams Schema. Defined query params are: ["search","minRating","sortBy"].'
    );
  });

  test('It throws an error if param has invalid type', () => {
    const schema = {
      search: QPARAMS.string(),
      minRating: QPARAMS.number(0),
      sortBy: QPARAMS.string('price'),
    };

    expect(() => {
      buildQueryString(schema, {
        // @ts-expect-error
        search: 3,
      });
    }).toThrow('search was expecting a string but received a number.');
  });

  test('It creates a new query string with param outside the schema', () => {
    const schema = {
      search: QPARAMS.string(),
      minRating: QPARAMS.number(0),
      sortBy: QPARAMS.string('price'),
    };

    const queryString = buildQueryString(
      schema,
      {
        search: 'sport shoes',
        sortBy: 'rating',
      },
      undefined,
      { utm_source: 'facebook' }
    );

    expect(queryString).toEqual(
      'utm_source=facebook&search=sport+shoes&sortBy=rating'
    );
  });
});
