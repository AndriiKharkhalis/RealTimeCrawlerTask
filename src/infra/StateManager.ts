import { IStateManager } from '../domain';
import { SportEvent, Score, EventStatus } from '../types/types';

export class StateManager implements IStateManager {
  private state: Record<string, SportEvent> = {};

  updateState(events: SportEvent[]): void {
    events.forEach((event) => {
      const existingEvent = this.state[event.id];

      if (existingEvent) {
        const updatedScores = event.scores
          ? Object.keys(event.scores).reduce(
              (acc, key) => {
                acc[key] = {
                  ...event.scores[key],
                };
                return acc;
              },
              {} as Record<string, Score>,
            )
          : {};

        existingEvent.scores = updatedScores;
        existingEvent.status = event.status;

        return;
      }

      this.state[event.id] = {
        ...event,
        scores: event.scores ? { ...event.scores } : {},
      };
    });
  }

  getFilteredState(): Record<string, SportEvent> {
    return Object.fromEntries(
      Object.entries(this.state).filter(([, event]) => event.status !== EventStatus.REMOVED),
    );
  }

  getAllStates(): Record<string, SportEvent> {
    return this.state;
  }

  resetState(): void {
    this.state = {};
  }
}
