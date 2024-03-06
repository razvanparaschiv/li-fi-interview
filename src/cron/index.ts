/* istanbul ignore file */
import cron from 'node-cron';
import feeCollectorScanner from './fee-collector-scanner';

export const run = (): void => {
  cron.schedule(feeCollectorScanner.schedule, feeCollectorScanner.job);
};

export default { run };
