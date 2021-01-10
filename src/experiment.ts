// const mainObject = {
//   testString: { getValue: () => "hello world"},
//   testBool: { getValue: () => true},
//   testNumber: { getValue: () => 30 }
// }
import { isUndefined } from './internal/typeChecking';

export type QueryParamOptions = Partial<{
  allowNull: boolean;
  allowUndefined: boolean;
  // validator:
}>;

export type QueryParamValue<
  T,
  Options extends QueryParamOptions
> = ResolveUndefinedType<ResolveNullType<T, Options>, Options>;

export type ResolveNullType<
  T,
  Options extends QueryParamOptions
> = Options extends {
  allowNull: true;
}
  ? T | null
  : T;

export type ResolveUndefinedType<
  T,
  Options extends QueryParamOptions
> = Options extends {
  allowUndefined: true;
}
  ? T | undefined
  : T;

// Cool trick
type _<T> = T;
type FlattenTypes<T> = _<{ [k in keyof T]: T[k] }>;

type Serializer<T, MyOptions> = {
  toUrl: (value: QueryParamValue<T, MyOptions>) => string;
  fromUrl: (value: string) => QueryParamValue<T, MyOptions>;
};

type QueryParamDef<T, MyOptions extends Partial<QueryParamOptions>> = {
  // SWITCHING RETURN VALUE TO "string" breaks typescript!?!?
  toUrl: (value: QueryParamValue<T, MyOptions>) => any;
  fromUrl: (value: string) => QueryParamValue<T, MyOptions>;
};

// class QueryParamDef<T> {
//   serializer: Serializer;
//   constructor(serializer: Serializer) {
//     this.serializer = serializer;
//   }

//   toUrl(value: T): string {
//     return this.serializer.toUrl(value);
//   }

//   fromUrl(value: string): T {
//     return this.serializer.fromUrl(value);
//   }
// }

function createQueryParamDef<T, MyOptions extends Partial<QueryParamOptions>>(
  serializer: Serializer<T, MyOptions>,
  options: MyOptions
) {
  return {
    toUrl(
      value: QueryParamValue<T, MyOptions>
    ): QueryParamValue<string, MyOptions> {
      return serializer.toUrl(value) as QueryParamValue<string, MyOptions>;
    },
    fromUrl(value: string): QueryParamValue<T, MyOptions> {
      return serializer.fromUrl(value);
    },
  };
}

type IQueryParamsStateSchema = Record<
  string,
  QueryParamDef<any, QueryParamOptions>
>;

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

// const schema = {
//   testString: SERIALIZERS.string,
//   testBool: SERIALIZERS.boolean,
//   testNumber: SERIALIZERS.number,
// };

// const schema = {
//   testString: new QueryParamDef<string>(SERIALIZERS.string),
//   testBool: new QueryParamDef<boolean>(SERIALIZERS.boolean),
//   testNumber: new QueryParamDef<number>(SERIALIZERS.number),
// };
const schema = {
  testString: createQueryParamDef(SERIALIZERS.string, {
    allowNull: true,
  }),
  testBool: createQueryParamDef(SERIALIZERS.boolean, {
    allowNull: true,
    allowUndefined: true,
  }),
  testNumber: createQueryParamDef(SERIALIZERS.number, {
    allowNull: false,
  }),
};

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
export type SerializedQueryParams<
  QueryParamsSchema extends IQueryParamsStateSchema
> = {
  [P in keyof QueryParamsSchema]: ReturnType<QueryParamsSchema[P]['toUrl']>;
};

export function serializeQueryParams<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamsSchema: QueryParamsSchema,
  queryParams: QueryParamsState<QueryParamsSchema>
): FlattenTypes<SerializedQueryParams<QueryParamsSchema>> {
  return Object.keys(queryParams).reduce(
    (
      acc: SerializedQueryParams<QueryParamsSchema>,
      queryParamKey: keyof QueryParamsSchema
    ) => {
      const queryParamDef = queryParamsSchema[queryParamKey];
      if (!queryParamDef) {
        // const availableQueryParamsKeys = Object.keys(queryParamsSchema);
        // throw new Errors.QueryParamsUpdateError(
        //   `"${queryParamKey}" is not defined in queryParams Schema. Defined query params are: ${JSON.stringify(
        //     availableQueryParamsKeys
        //   )}.`
        // );
      }
      try {
        let value = queryParamDef.toUrl(queryParams[queryParamKey]);
        if (!isUndefined(value)) {
          acc[queryParamKey] = value;
        }
      } catch (error) {
        // Add query param name information to the error
        error.message = `${queryParamKey} ${error.message}`;
        throw error;
      }
      return acc;
    },
    {} as SerializedQueryParams<QueryParamsSchema>
  );

  // const encodedQuery = {} as SerializedQueryParams<QueryParamsSchema>;

  // const paramNames = Object.keys(queryParams);

  // for (const paramName of paramNames) {
  //   const decodedValue = queryParams[paramName];

  //   encodedQuery[paramName as keyof QueryParamsSchema] = queryParamSchema[
  //     paramName
  //   ].toUrl(decodedValue);
  // }

  // return encodedQuery;
}

export function deserializeQueryParams<
  QueryParamsSchema extends IQueryParamsStateSchema
>(
  queryParamSchema: QueryParamsSchema,
  encodedQuery: SerializedQueryParams<QueryParamsSchema>
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

const serializedQueryParams = serializeQueryParams(schema, mainObject2);
const queryParams = deserializeQueryParams(schema, {
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
