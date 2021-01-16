import { createQueryParamDef } from '../src/internal/createQueryParamDef';
import { QPARAMS } from '../src/index';

describe('Test', () => {
  const test = QPARAMS.string(null, { allowNull: true });

  const value = test.fromURL('hello');
});
