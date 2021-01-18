import { QueryParamDef, QueryParamOptions, Serializer } from './types';
import { createQueryParamDef } from './createQueryParamDef';
import { SERIALIZERS } from './serializers';
/**
 * Object used to build your query params state schema.
 * It contains a factory function for each param type.
 */
export const QueryParams = {
  boolean: <MyOptions extends QueryParamOptions>(
    queryParamsOptions: MyOptions
  ) => {
    const serializer = SERIALIZERS.boolean as Serializer<boolean, MyOptions>;
    return createQueryParamDef(serializer, queryParamsOptions);
  },
};
