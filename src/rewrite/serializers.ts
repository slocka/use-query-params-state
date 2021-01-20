import { isUndefined } from '../internal/typeChecking';
import { isNumber, isNil, getTypeName } from '../internal/typeChecking';
import { Errors } from '../errors';

import {
  FlattenTypes,
  IQueryParamsStateSchema,
  QueryParamsState,
  SerializedQueryParams,
  Serializer,
} from './types';

export const SERIALIZERS = {
  string: {
    toUrl: (value: any): string => value.toString(),
    fromUrl: (value: string) => value,
  },
  boolean: {
    fromUrl: (str?: string | null): boolean | null | undefined => {
      if (isNil(str)) {
        return str;
      }

      if (str === 'true') {
        return true;
      }

      if (str === 'false') {
        return false;
      }

      // This is the scenario where we have `?flag`,
      // flag value is an empty string.
      if (str === '') {
        return true;
      }

      return undefined;
    },
    toUrl: (bool?: boolean | null): string | null | undefined => {
      if (isNil(bool)) {
        return bool;
      }

      if (typeof bool !== 'boolean') {
        throw new Errors.QueryParamsUpdateError(
          `was expecting a boolean but received a ${getTypeName(bool)}.`
        );
      }

      return bool.toString();
    },
  } as Serializer<boolean, any>,
  number: {
    toUrl: (value: any): string => value.toString(),
    fromUrl: (value: string) => parseInt(value),
  },
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
