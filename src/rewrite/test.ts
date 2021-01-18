import { createQueryParamDef } from './createQueryParamDef';
import {
  deserializeQueryParams,
  serializeQueryParams,
  SERIALIZERS,
} from './serializers';

import { QueryParams } from './QueryParams';

const schema = {
  testString: createQueryParamDef(SERIALIZERS.string, {
    allowNull: true,
  }),
  testBool: QueryParams.boolean({
    allowNull: true,
    allowUndefined: true,
  }),
  testNumber: createQueryParamDef(SERIALIZERS.number, {
    allowNull: false,
  }),
  testBool2: QueryParams.boolean({
    allowNull: true,
    allowUndefined: true,
  } as const),
};

const mainObject2 = {
  testString: 'hello world',
  testBool: true,
  testNumber: 30,
  testBool2: false,
};

const serializedQueryParams = serializeQueryParams(schema, mainObject2);
// testBool2 has lost | null | undefined
const queryParams = deserializeQueryParams(schema, {
  testString: 'hello world',
  testBool: 'true',
  testBool2: 'false',
  testNumber: '30',
});
