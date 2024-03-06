import { getModelForClass, prop } from '@typegoose/typegoose';
import { BlockTag } from '@ethersproject/providers';
import { Address, Chain } from '../types';

export class ContractConfig {
  @prop({ required: true })
  address: Address;

  @prop({ required: true })
  label: string;

  @prop({ required: true })
  lastSynchronizedBlock: BlockTag;
}

export class ChainConfiguration {
  @prop({ required: true })
  chainId: Chain;

  @prop({ required: true, default: [] })
  contracts: ContractConfig[];
}

export const ChainConfigurationModel = getModelForClass(ChainConfiguration);
