import { getEnvOrThrow, parseChainIdsEnvironment } from '../utils';
import { Chain, ChainMap } from '../types';

type ConfigData = {
  rpcProvider: string;
  maxQueryableBlocks: number;
};

type GlobalConfig = {
  mongoUri: string;
};

export class Config {
  static enabledChains = parseChainIdsEnvironment();
  global: GlobalConfig;
  chainConfig: ChainMap<ConfigData> = {};

  constructor() {
    for (const chainId of Config.enabledChains) {
      this.chainConfig[chainId] = {
        rpcProvider: getEnvOrThrow(`HTTP_RPC_PROVIDER_${chainId}`),
        maxQueryableBlocks: parseInt(
          getEnvOrThrow(`MAX_QUERYABLE_BLOCKS_${chainId}`, '10000'),
        ),
      };
    }

    this.global = {
      mongoUri: getEnvOrThrow('MONGO_URI'),
    };
  }

  getChainConfig(chainId: Chain): ConfigData {
    if (!this.chainConfig[chainId]) {
      throw new Error(`Configuration not set for ${chainId}`);
    }

    return this.chainConfig[chainId];
  }

  getGlobalConfig(): GlobalConfig {
    return this.global;
  }
}

export default new Config();
