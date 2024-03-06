import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Chain, ChainMap } from '../types';
import config, { Config } from '../config';

export interface RpcProviderData {
  rpcProvider: JsonRpcProvider;
  maxQueryableBlocks: number;
}

export class ProviderManager {
  static providers: ChainMap<RpcProviderData> = {};

  static Init(): void {
    for (const chainId of Config.enabledChains) {
      const chainConfig = config.getChainConfig(chainId);

      this.providers[chainId] = {
        rpcProvider: new ethers.providers.JsonRpcProvider(
          chainConfig.rpcProvider,
        ),
        maxQueryableBlocks: chainConfig.maxQueryableBlocks,
      };
    }
  }

  static getRpcProvider(chain: Chain): RpcProviderData {
    const provider = this.providers[chain];

    if (!provider) {
      throw new Error(`Provider not found for (${chain})`);
    }

    return provider;
  }
}
