import { SportEvent } from '../types/types';

export interface IStateManager {
  updateState(events: SportEvent[]): void;
  getFilteredState(): Record<string, SportEvent>;
  getAllStates(): Record<string, SportEvent>;
  resetState(): void;
}
