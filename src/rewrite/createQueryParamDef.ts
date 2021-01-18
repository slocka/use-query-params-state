import { QueryParamOptions, QueryParamValue, Serializer } from './types';

export function createQueryParamDef<
  T,
  MyOptions extends Partial<QueryParamOptions>
>(serializer: Serializer<T, MyOptions>, options: MyOptions) {
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
