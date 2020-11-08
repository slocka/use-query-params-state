import { DefaultValue } from './types';
import { QueryParamDef } from './queryParamDef';

import serializers from './serializer/serializers';

export const QPARAMS = {
  number: (defaultValue?: DefaultValue<number>) => {
    const serializer = serializers.NUMBER;
    return new QueryParamDef(serializer, defaultValue);
  },
  string: (defaultValue?: DefaultValue<string>) => {
    const serializer = serializers.STRING;
    return new QueryParamDef(serializer, defaultValue);
  },
  boolean: (defaultValue?: DefaultValue<boolean>) => {
    const serializer = serializers.BOOLEAN;
    return new QueryParamDef(serializer, defaultValue);
  },
  arrayOfNumbers: (defaultValue?: DefaultValue<number[]>) => {
    const serializer = serializers.ARRAY__NUMBERS;
    return new QueryParamDef(serializer, defaultValue);
  },
  arrayOfStrings: (defaultValue?: DefaultValue<string[]>) => {
    const serializer = serializers.ARRAY__STRINGS;
    return new QueryParamDef(serializer, defaultValue);
  },
};
