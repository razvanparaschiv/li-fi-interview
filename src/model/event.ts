import { getModelForClass, prop } from '@typegoose/typegoose';
import { Address } from '../types';

export class Event {
  @prop({ required: true })
  public integrator!: Address;

  @prop({ required: true })
  public integratorFee!: string;

  @prop({ required: true })
  public lifiFee!: string;

  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public token: Address;
}

export const EventModel = getModelForClass(Event);
