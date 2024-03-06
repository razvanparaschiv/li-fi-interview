import { Config } from '../config';
import { FeeCollector__factory } from 'lifi-contract-types';
import { ethers } from 'ethers';
import { EventModel } from '../model/event';
import { parseEvents, wrapCronJob } from '../utils';
import { chainManagerProvider } from '../scanner/chain-manager-provider';
import { ChainConfigurationModel } from '../model/chain-configuration';
import { ChainManager } from '../scanner/chain-manager';
import { BlockTag } from '@ethersproject/providers';

interface ParsedFeeCollectedEvents {
  token: string; // the address of the token that was collected
  integrator: string; // the integrator that triggered the fee collection
  integratorFee: string; // the share collector for the integrator
  lifiFee: string; // the share collected for lifi
  name: string;
}

export const schedule = '*/20 * * * * *'; // Every 20 seconds

let isRunning = false;

export const feeCollectorScan = async (toBlock: BlockTag): Promise<void> => {
  for (const chain of Config.enabledChains) {
    const chainManager = chainManagerProvider.getChainManager(chain);

    const chainConfig = await ChainConfigurationModel.findOne({
      chainId: chain,
    });

    const contractConfig = chainConfig.contracts.find(
      (cf) => cf.label === 'FeeCollector',
    );

    if (!contractConfig) {
      throw new Error('Missing configuration');
    }

    const latestBlock =
      toBlock || (await chainManager.rpcProvider.getBlockNumber());

    const parsedEvents = await fetchEvents(
      contractConfig.address,
      contractConfig.lastSynchronizedBlock,
      latestBlock,
      chainManager,
    );

    await EventModel.insertMany(parsedEvents);

    contractConfig.lastSynchronizedBlock = latestBlock;

    chainConfig.markModified('contracts');

    await chainConfig.save();
  }
};

const job = async (): Promise<void> =>
  wrapCronJob(
    (status) => {
      isRunning = status;
    },
    () => isRunning,
    'fee_collector_scan',
    feeCollectorScan,
  );

const fetchEvents = async (
  contractAddress: string,
  fromBlock: BlockTag,
  toBlock: BlockTag,
  chainManager: ChainManager,
): Promise<Array<ParsedFeeCollectedEvents>> => {
  const feeCollectorContract = new ethers.Contract(
    contractAddress,
    FeeCollector__factory.createInterface(),
    chainManager.rpcProvider,
  );

  const events = await chainManager.loadEvents(
    feeCollectorContract,
    'FeesCollected',
    fromBlock,
    toBlock,
  );

  return parseEvents<ParsedFeeCollectedEvents>(
    feeCollectorContract,
    events,
    (parsedEvent) => ({
      token: parsedEvent.args[0].toLowerCase(),
      integrator: parsedEvent.args[1].toLowerCase(),
      integratorFee: parsedEvent.args[2],
      lifiFee: parsedEvent.args[3],
      name: parsedEvent.name,
    }),
  );
};

export default {
  schedule,
  job,
};
