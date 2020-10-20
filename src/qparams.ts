import { DefaultValue } from './types';
import { QueryParamDef } from './queryParamDef';
import serializers from './serializer/serializers';

export const QPARAMS = {
  number: (defaultValue?: DefaultValue<number>) => {
    return new QueryParamDef<number>(serializers.NUMBER, defaultValue);
  },
  string: (defaultValue?: DefaultValue<string>) => {
    return new QueryParamDef<string>(serializers.STRING, defaultValue);
  },
  boolean: (defaultValue?: DefaultValue<boolean>) => {
    return new QueryParamDef<boolean>(serializers.BOOLEAN, defaultValue);
  },
  arrayOfNumbers: (defaultValue?: DefaultValue<number[]>) => {
    return new QueryParamDef<number[]>(
      serializers.ARRAY__NUMBERS,
      defaultValue
    );
  },
  arrayOfStrings: (defaultValue?: DefaultValue<string[]>) => {
    return new QueryParamDef<string[]>(
      serializers.ARRAY__STRINGS,
      defaultValue
    );
  },
};
