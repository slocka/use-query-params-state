import { DefaultValue } from './types';
import { QueryParamDef } from './queryParamDef';

export const QPARAMS = {
  number: (defaultValue?: DefaultValue<number>) => {
    return new QueryParamDef('NUMBER', defaultValue);
  },
  string: (defaultValue?: DefaultValue<string>) => {
    return new QueryParamDef('STRING', defaultValue);
  },
  boolean: (defaultValue?: DefaultValue<boolean>) => {
    return new QueryParamDef('BOOLEAN', defaultValue);
  },
  arrayOfNumbers: (defaultValue?: DefaultValue<number[]>) => {
    return new QueryParamDef('ARRAY__NUMBERS', defaultValue);
  },
  arrayOfStrings: (defaultValue?: DefaultValue<string[]>) => {
    return new QueryParamDef('ARRAY__STRINGS', defaultValue);
  },
};
