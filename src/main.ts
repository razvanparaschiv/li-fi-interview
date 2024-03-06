/* istanbul ignore file */
/**
 * Some predefined delay values (in milliseconds).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import server from './server';
import cron from './cron';
import config from './config';
import { ProviderManager } from './scanner/provider-manager';
import { chainManagerProvider } from './scanner/chain-manager-provider';
import { setGlobalOptions, Severity } from '@typegoose/typegoose';

setGlobalOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
});

const start = async (): Promise<void> => {
  try {
    const globalConfig = config.getGlobalConfig();

    await mongoose.connect(globalConfig.mongoUri);

    ProviderManager.Init();
    chainManagerProvider.init();
    server.run();
    cron.run();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
