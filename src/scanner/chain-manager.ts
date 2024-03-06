import { BlockTag, JsonRpcProvider } from '@ethersproject/providers';
import { Contract, ethers } from 'ethers';
import { EventFilter } from '@ethersproject/contracts';
import { Chain } from '../types';
import { pRateLimit } from 'p-ratelimit';
import { RpcProviderData } from './provider-manager';

const limit = pRateLimit({
  interval: 1000, // 1000 ms == 1 second
  rate: 40, // 40 API calls per interval
  concurrency: 15, // no more than 15 running at once
});

export class ChainManager {
  chainId: Chain;
  rpcProvider: JsonRpcProvider;
  maxQueryableBlocks: number;

  constructor(chain: Chain, rpcProviderData: RpcProviderData) {
    this.chainId = chain;
    this.rpcProvider = rpcProviderData.rpcProvider;
    this.maxQueryableBlocks = rpcProviderData.maxQueryableBlocks;
  }

  private async queryFilterBatch(
    contract: Contract,
    filter: EventFilter,
    fromBlock: number,
    toBlock: number,
  ): Promise<ethers.Event[]> {
    const queryFilterBatch = [];

    for (
      let startBlock = fromBlock;
      startBlock < toBlock;
      startBlock =
        Math.min(startBlock + this.maxQueryableBlocks, toBlock) + 1
    ) {
      const endBlock = Math.min(startBlock + this.maxQueryableBlocks, toBlock);

      queryFilterBatch.push(() =>
        limit(() => contract.queryFilter(filter, startBlock, endBlock)),
      );

    }

    const batchedEvents = await Promise.all(queryFilterBatch.map((p) => p()));

    return batchedEvents.flat();
  }

  public async loadEvents(
    contract: Contract,
    event: string,
    fromBlock: BlockTag,
    toBlock: BlockTag,
  ): Promise<ethers.Event[]> {
    const filter = contract.filters[event]();

    return this.queryFilterBatch(
      contract,
      filter,
      Number(fromBlock),
      Number(toBlock),
    );
  }
}
