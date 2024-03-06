import { Chain, ChainMap } from '../types';
import { Config } from '../config';
import { ProviderManager } from './provider-manager';
import { ChainManager } from './chain-manager';

export class ChainManagerProvider {
  private chainManagers: ChainMap<ChainManager> = {};

  init(): void {
    for (const chain of Config.enabledChains) {
      this.chainManagers[chain] = new ChainManager(
        chain,
        ProviderManager.getRpcProvider(chain),
      );
    }
  }

  getChainManager(chainId: Chain): ChainManager {
    const blockManager = this.chainManagers[chainId];
    if (!blockManager) {
      throw new Error(
        'ChainManager does not exists probably you forget env variable for this network',
      );
    }

    return blockManager;
  }
}

export const chainManagerProvider = new ChainManagerProvider();
