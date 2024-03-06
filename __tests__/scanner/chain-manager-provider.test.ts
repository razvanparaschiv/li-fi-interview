jest.mock('../../src/config', () => ({
  Config: {
    enabledChains: ['1', '137'],
  },
}));

jest.mock('../../src/scanner/provider-manager', () => ({
  ProviderManager: {
    getRpcProvider: jest.fn().mockImplementation((chain) => ({
      rpcProvider: `${chain.toLowerCase()}.rpc.url`,
      maxQueryableBlocks: 10000,
    })),
  },
}));

import { ChainManagerProvider } from '../../src/scanner/chain-manager-provider';

describe('ChainManagerProvider', () => {
  let chainManagerProvider;

  beforeEach(() => {
    chainManagerProvider = new ChainManagerProvider();
    chainManagerProvider.init();
  });

  it('initializes chain managers for enabled chains', () => {
    expect(chainManagerProvider.getChainManager('1')).toBeDefined();
    expect(chainManagerProvider.getChainManager('137')).toBeDefined();
  });

  it('throws an error for an unsupported chain', () => {
    expect(() =>
      chainManagerProvider.getChainManager('UNSUPPORTED_CHAIN'),
    ).toThrow();
  });

  it('correctly returns a ChainManager instance for a supported chain', () => {
    const chainManager = chainManagerProvider.getChainManager('137');
    expect(chainManager.rpcProvider).toBe('137.rpc.url');
    expect(chainManager.maxQueryableBlocks).toBe(10000);
  });
});
