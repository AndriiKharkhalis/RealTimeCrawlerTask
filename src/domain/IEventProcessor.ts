import { SportEvent } from '../types/types';

export interface IEventProcessor {
  startFetching(interval: number, duration: number): Promise<void>;
  getFilteredState(): Record<string, SportEvent>;
}
