jest.mock('../../src/utils', () => ({
  getEnvOrThrow: jest.fn((key: string) => {
    if (key === 'MONGO_URI') {
      return 'mongodb://localhost:27017/myapp';
    }
    if (key.startsWith('HTTP_RPC_PROVIDER_')) {
      return `http://provider.com/${key}`;
    }
    if (key.startsWith('MAX_QUERYABLE_BLOCKS_')) {
      return '10000';
    }
    return null; // Return a default value or throw an error if you expect all keys to be handled
  }),
  parseChainIdsEnvironment: jest.fn(() => ['137']),
}));

import { Config } from '../../src/config';
import { Chain } from '../../src/types';
import { getEnvOrThrow } from '../../src/utils';

describe('Config class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes enabledChains from environment', () => {
    expect(Config.enabledChains).toEqual(['137']);
  });

  it('loads chain-specific configurations', () => {
    const config = new Config();
    expect(getEnvOrThrow).toHaveBeenCalledWith('HTTP_RPC_PROVIDER_137');
    expect(getEnvOrThrow).toHaveBeenCalledWith(
      'MAX_QUERYABLE_BLOCKS_137',
      10000,
    );
    expect(config.chainConfig['137']).toEqual({
      rpcProvider: 'http://provider.com/HTTP_RPC_PROVIDER_137',
      maxQueryableBlocks: 10000,
    });
  });

  it('loads global configurations', () => {
    const config = new Config();
    expect(getEnvOrThrow).toHaveBeenCalledWith('MONGO_URI');
    expect(config.global.mongoUri).toBe('mongodb://localhost:27017/myapp');
  });

  it('returns chain-specific configuration when requested', () => {
    const config = new Config();
    const chainConfig = config.getChainConfig(Chain.POLYGON);
    expect(chainConfig).toEqual({
      rpcProvider: 'http://provider.com/HTTP_RPC_PROVIDER_137',
      maxQueryableBlocks: 10000,
    });
  });

  it('throws an error when requesting configuration for an unsupported chain', () => {
    const config = new Config();
    expect(() => config.getChainConfig('UNSUPPORTED_CHAIN' as Chain)).toThrow();
  });
});
