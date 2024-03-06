import { Contract, ethers } from 'ethers';
import { LogDescription } from '@ethersproject/abi/src.ts/interface';
import { Chain } from '../types';
import { EnvironmentError } from '../types/error/environment-error';

export const parseChainIdsEnvironment = (): Chain[] => {
  const chainIds = getEnvOrThrow('CHAIN_IDS');

  return chainIds.split(',').map((id) => {
    return id as Chain;
  });
};

export function getEnvOrThrow(
  name: string,
  defaultValue: string = undefined,
): string {
  const value = process.env[name];

  if (value === undefined && !defaultValue) {
    throw new EnvironmentError(name);
  }

  return value || defaultValue;
}

export function parseEvents<T>(
  contract: Contract,
  events: ethers.Event[],
  mapper: (lgDsc: LogDescription) => T,
): T[] {
  return events
    .map((e) => {
      return contract.interface.parseLog(e);
    })
    .map(mapper);
}

export async function wrapCronJob(
  setStatus: (sts: boolean) => void,
  isRunning: () => boolean,
  job: string,
  doJob: Function,
): Promise<void> {
  if (isRunning()) {
    console.log(`${job} already running. Skipping`);
    return;
  }

  try {
    console.log(`Starting ${job}`);
    setStatus(true);

    await doJob();
  } catch (e) {
    console.error(`${job} error`, e);
    throw e;
  } finally {
    console.log(`${job} finished`);
    setStatus(false);
  }
}
