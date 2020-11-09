import { DefaultValue } from './types';
import { QueryParamDef } from './queryParamDef';

import serializers from './serializer/serializers';

export const QPARAMS = {
  number: (defaultValue?: DefaultValue<number>) => {
    return new QueryParamDef(serializers.NUMBER, defaultValue);
  },
  string: (defaultValue?: DefaultValue<string>) => {
    return new QueryParamDef(serializers.STRING, defaultValue);
  },
  boolean: (defaultValue?: DefaultValue<boolean>) => {
    return new QueryParamDef(serializers.BOOLEAN, defaultValue);
  },
  arrayOfNumbers: (defaultValue?: DefaultValue<number[]>) => {
    return new QueryParamDef(serializers.ARRAY__NUMBERS, defaultValue);
  },
  arrayOfStrings: (defaultValue?: DefaultValue<string[]>) => {
    return new QueryParamDef(serializers.ARRAY__STRINGS, defaultValue);
  },
};
