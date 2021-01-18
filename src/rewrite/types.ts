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
export type FlattenTypes<T> = _<{ [k in keyof T]: T[k] }>;

export type Serializer<T, MyOptions> = {
  toUrl: (value: QueryParamValue<T, MyOptions>) => string;
  fromUrl: (value: string) => QueryParamValue<T, MyOptions>;
};

export type QueryParamDef<T, MyOptions extends Partial<QueryParamOptions>> = {
  // SWITCHING RETURN VALUE TO "string" breaks typescript!?!?
  toUrl: (value: QueryParamValue<T, MyOptions>) => any;
  fromUrl: (value: string) => QueryParamValue<T, MyOptions>;
};

export type IQueryParamsStateSchema = Record<
  string,
  QueryParamDef<any, QueryParamOptions>
>;

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
