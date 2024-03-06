jest.mock('../../src/config', () => ({
  Config: {
    enabledChains: ['137'], // Example chains
  },
  getChainConfig: jest.fn((chainId) => {
    if (chainId === '137') {
      return { rpcProvider: 'https://137.rpc.url', maxQueryableBlocks: 12000 };
    }
    throw new Error('Chain not supported');
  }),
}));

import { Chain } from '../../src/types';
import { ProviderManager } from '../../src/scanner/provider-manager';

describe('ProviderManager', () => {
  beforeAll(() => {
    ProviderManager.Init();
  });

  it('initializes providers for enabled chains', () => {
    const bscProvider = ProviderManager.getRpcProvider(Chain.POLYGON);
    expect(bscProvider.rpcProvider).toBeDefined();
    expect(bscProvider.maxQueryableBlocks).toBe(12000);
  });

  it('throws an error for unsupported chains', () => {
    expect(() =>
      ProviderManager.getRpcProvider('UNSUPPORTED_CHAIN' as Chain),
    ).toThrow();
  });
});
