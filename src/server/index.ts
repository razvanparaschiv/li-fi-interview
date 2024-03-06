/* istanbul ignore file */
import express from 'express';
import { getFeesCollectedEvents } from './controller/event';
import { getEnvOrThrow } from '../utils';

const app = express();

app.use(express.json());

app.get('/fee_collector', getFeesCollectedEvents);

const run = (): void => {
  app.listen(parseInt(getEnvOrThrow('PORT', '3000')), () => {
    console.log('Server started on port 3000');
  });
};

export default { run };
