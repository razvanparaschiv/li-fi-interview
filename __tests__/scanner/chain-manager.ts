import { EventFilter } from '@ethersproject/contracts/src.ts';

jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers'); // Get the actual ethers module

  return {
    ethers: {
      ...actualEthers.ethers,
      Contract: class {
        filters = {
          FeesCollected: (): EventFilter => ({
            address: '0xContractAddress',
            topics: [
              actualEthers.utils.id('EventName(address,address,uint256)'),
            ],
          }),
        };
        queryFilter = jest.fn().mockResolvedValue([]);
      },
    },
  };
});

import { ethers } from 'ethers';
import { Chain } from '../../src/types';
import { RpcProviderData } from '../../src/scanner/provider-manager';
import { ChainManager } from '../../src/scanner/chain-manager';

describe('ChainManager', () => {
  const mockRpcProviderData: RpcProviderData = {
    rpcProvider: null,
    maxQueryableBlocks: 100,
  };

  const chainManager = new ChainManager(Chain.POLYGON, mockRpcProviderData);

  const mockContract = new ethers.Contract(
    'address',
    'interface',
    chainManager.rpcProvider,
  );

  it('loads events using loadEvents method', async () => {
    const fromBlock = 0;
    const toBlock = 500;

    const events = await chainManager.loadEvents(
      mockContract,
      'FeesCollected',
      fromBlock,
      toBlock,
    );

    expect(events).toEqual([]);
    expect(mockContract.queryFilter).toHaveBeenCalledTimes(5);
  });
});
