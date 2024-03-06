import dotenv from 'dotenv';
import { setGlobalOptions, Severity } from '@typegoose/typegoose';

dotenv.config({ path: '.env.test' });
setGlobalOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
});
