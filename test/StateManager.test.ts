import { beforeEach, describe, expect, it } from 'vitest';
import { StateManager } from '../src/infra';
import { CompetitorType, EventStatus, SportEvent } from '../src/types/types';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should return all states', () => {
    const initialState: Record<string, SportEvent> = {
      'event-id-1': {
        id: 'event-id-1',
        status: EventStatus.LIVE,
        scores: {
          period1: {
            type: 'period1',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: CompetitorType.HOME,
            name: 'Juventus',
          },
          AWAY: {
            type: CompetitorType.AWAY,
            name: 'Paris Saint-Germain',
          },
        },
        competition: 'UEFA Champions League',
      },
    };

    stateManager.updateState(Object.values(initialState));
    expect(stateManager.getAllStates()).toEqual(initialState);
  });

  it('should update the state with new events', () => {
    const initialState: Record<string, SportEvent> = {
      'event-id-1': {
        id: 'event-id-1',
        status: EventStatus.LIVE,
        scores: {
          period1: {
            type: 'period1',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: CompetitorType.HOME,
            name: 'Juventus',
          },
          AWAY: {
            type: CompetitorType.AWAY,
            name: 'Paris Saint-Germain',
          },
        },
        competition: 'UEFA Champions League',
      },
    };

    stateManager.updateState(Object.values(initialState));

    const newEvents: SportEvent[] = [
      {
        id: 'event-id-1',
        status: EventStatus.LIVE,
        scores: {
          period1: {
            type: 'period1',
            home: '2',
            away: '1',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: CompetitorType.HOME,
            name: 'Juventus',
          },
          AWAY: {
            type: CompetitorType.AWAY,
            name: 'Paris Saint-Germain',
          },
        },
        competition: 'UEFA Champions League',
      },
    ];

    stateManager.updateState(newEvents);
    expect(stateManager.getAllStates()).toEqual({
      'event-id-1': {
        id: 'event-id-1',
        status: EventStatus.LIVE,
        scores: {
          period1: {
            type: 'period1',
            home: '2',
            away: '1',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'Juventus',
          },
          AWAY: {
            type: 'AWAY',
            name: 'Paris Saint-Germain',
          },
        },
        competition: 'UEFA Champions League',
      },
    });
  });

  it('should filter out events with status REMOVED', () => {
    const initialState: Record<string, SportEvent> = {
      'event-id-1': {
        id: 'event-id-1',
        status: EventStatus.REMOVED,
        scores: {
          period1: {
            type: 'period1',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: CompetitorType.HOME,
            name: 'Juventus',
          },
          AWAY: {
            type: CompetitorType.AWAY,
            name: 'Paris Saint-Germain',
          },
        },
        competition: 'UEFA Champions League',
      },
      'event-id-2': {
        id: 'event-id-2',
        status: EventStatus.LIVE,
        scores: {
          period1: {
            type: 'period1',
            home: '0',
            away: '0',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: CompetitorType.HOME,
            name: 'Real Madrid',
          },
          AWAY: {
            type: CompetitorType.AWAY,
            name: 'Barcelona',
          },
        },
        competition: 'La Liga',
      },
    };

    stateManager.updateState(Object.values(initialState));
    expect(stateManager.getFilteredState()).toEqual({
      'event-id-2': {
        id: 'event-id-2',
        status: EventStatus.LIVE,
        scores: {
          period1: {
            type: 'period1',
            home: '0',
            away: '0',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'Real Madrid',
          },
          AWAY: {
            type: 'AWAY',
            name: 'Barcelona',
          },
        },
        competition: 'La Liga',
      },
    });
  });

  it('should reset the state', () => {
    const initialState: Record<string, SportEvent> = {
      'event-id-1': {
        id: 'event-id-1',
        status: EventStatus.LIVE,
        scores: {
          period1: {
            type: 'period1',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'football',
        competitors: {
          HOME: {
            type: CompetitorType.HOME,
            name: 'Juventus',
          },
          AWAY: {
            type: CompetitorType.AWAY,
            name: 'Paris Saint-Germain',
          },
        },
        competition: 'UEFA Champions League',
      },
    };

    stateManager.updateState(Object.values(initialState));
    stateManager.resetState();
    expect(stateManager.getAllStates()).toEqual({});
  });
});
