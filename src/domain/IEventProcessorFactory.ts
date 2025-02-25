import { IEventProcessor } from './IEventProcessor';

export interface IEventProcessorFactory {
  createEventProcessor(): IEventProcessor;
}
