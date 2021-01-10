// const mainObject = {
//   testString: { getValue: () => "hello world"},
//   testBool: { getValue: () => true},
//   testNumber: { getValue: () => 30 }
// }

// Cool trick
type _<T> = T;
type FlattenTypes<T> = _<{ [k in keyof T]: T[k] }>;

type Serializer = {
  encode: (value: any) => any;
  decode: (value: string) => any;
};

// type QueryParamDef = {
//   toUrl: (value: any) => any;
//   fromUrl: (value: string) => any;
// };

type QueryParamDef<T> = {
  toUrl: (value: T) => any;
  fromUrl: (value: string) => T;
};

// class QueryParamDef<T> {
//   serializer: Serializer;
//   constructor(serializer: Serializer) {
//     this.serializer = serializer;
//   }

//   toUrl(value: T): string {
//     return this.serializer.encode(value);
//   }

//   fromUrl(value: string): T {
//     return this.serializer.decode(value);
//   }
// }

type IQueryParamsStateSchema = Record<string, QueryParamDef<any>>;

/** SOLUTION IS "encode" should be type "any" in Serializer but schema declaration "encode" function below specify a return type   */

// const schema = {
//   testString: {
//     toUrl: (value: any): string => value.toString(),
//     fromUrl: (value: string) => value,
//   },
//   testBool: {
//     toUrl: (value: any): string => value.toString(),
//     fromUrl: (value: string) => Boolean(value),
//   },
//   testNumber: {
//     toUrl: (value: any): string => value.toString(),
//     fromUrl: (value: string) => parseInt(value),
//   },
// };

const SERIALIZERS = {
  string: {
    toUrl: (value: any): string => value.toString(),
    fromUrl: (value: string) => value,
  },
  boolean: {
    toUrl: (value: any): string => value.toString(),
    fromUrl: (value: string) => Boolean(value),
  },
  number: {
    toUrl: (value: any): string => value.toString(),
    fromUrl: (value: string) => parseInt(value),
  },
};

const schema = {
  testString: SERIALIZERS.string,
  testBool: SERIALIZERS.boolean,
  testNumber: SERIALIZERS.number,
};

// const schema = {
//   testString: new QueryParamDef<string>(SERIALIZERS.string),
//   testBool: new QueryParamDef<boolean>(SERIALIZERS.boolean),
//   testNumber: new QueryParamDef<number>(SERIALIZERS.number),
// };

const mainObject2 = {
  testString: 'hello world',
  testBool: true,
  testNumber: 30,
};

/**
 * Mapping from a query parameter name to its decoded value type
 */
export type QueryParamsState<
  QueryParamsSchema extends IQueryParamsStateSchema
> = {
  [P in keyof QueryParamsSchema]: ReturnType<QueryParamsSchema[P]['fromUrl']>;
};

/**
 * Mapping from a query parameter name to its encoded value type
 */
export type RawQueryParams<
  QueryParamsSchema extends IQueryParamsStateSchema
> = {
  [P in keyof QueryParamsSchema]: ReturnType<QueryParamsSchema[P]['toUrl']>; //string | (string | null)[] | null | undefined;
};

export function encodeQueryParams<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamSchema: QueryParamsSchema,
  queryParams: QueryParamsState<QueryParamsSchema>
): FlattenTypes<RawQueryParams<QueryParamsSchema>> {
  const encodedQuery = {} as RawQueryParams<QueryParamsSchema>;

  const paramNames = Object.keys(queryParams);
  for (const paramName of paramNames) {
    const decodedValue = queryParams[paramName];

    encodedQuery[paramName as keyof QueryParamsSchema] = queryParamSchema[
      paramName
    ].toUrl(decodedValue);
  }

  return encodedQuery;
}

export function decodeQueryParams<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamSchema: QueryParamsSchema,
  encodedQuery: RawQueryParams<QueryParamsSchema>
): FlattenTypes<QueryParamsState<QueryParamsSchema>> {
  const decodedQuery = {} as QueryParamsState<QueryParamsSchema>;

  // iterate over all keys in the config (#30)
  const paramNames = Object.keys(queryParamSchema);

  for (const paramName of paramNames) {
    const encodedValue = encodedQuery[paramName];

    decodedQuery[paramName as keyof QueryParamsSchema] = queryParamSchema[
      paramName
    ].fromUrl(encodedValue as string);
  }

  return decodedQuery;
}

const resEncoded = encodeQueryParams(schema, mainObject2);
const resDecoded = decodeQueryParams(schema, {
  testString: 'hello world',
  testBool: 'true',
  testNumber: '30',
});
// function test<S extends Record<string, { getValue: () => string }>>(input: S): Partial<RawObject<S>> {
//   const decodedQuery = {} as Partial<RawObject<S>>;
//    // iterate over all keys in the config (#30)
//   const paramNames = Object.keys(input);

//   for (const paramName of paramNames) {
//     // const encodedValue = input[paramName];

//     decodedQuery[paramName as keyof S] = input[
//       paramName
//     ].getValue();

//   }

//   return decodedQuery
//   // return Object.keys(input).reduce((acc: RawObject<T>, key: keyof T) => {
//   //   const value = input[key].getValue()
//   //   acc[key] = value

//   //   return acc
//   // }, {} as RawObject<T>)
// }

// const myTestObj = test(schema, mainObject2)
