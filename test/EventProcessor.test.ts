import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EventProcessor,
  EventValidator,
  MappingsLoader,
  OddsLoader,
  SportEventTransformer,
  StateManager,
  logger,
} from '../src/infra';

describe('EventProcessor', () => {
  let oddsLoader: OddsLoader;
  let mappingsLoader: MappingsLoader;
  let eventProcessor: EventProcessor;
  let stateManager: StateManager;
  let sportEventProcessor: SportEventTransformer;

  const oddsMockedData = [
    {
      sportEventId: 'event-id-1',
      sportId: '2',
      competitionId: '3',
      startTime: '1709900432183',
      homeCompetitorId: '5',
      awayCompetitorId: '6',
      sportEventStatusId: '7',
      scores: [
        {
          period: '8',
          home_score: '0',
          away_score: '0',
        },
      ],
    },
  ];

  const mappingsMockedData = new Map([
    ['2', 'sport'],
    ['3', 'competition'],
    ['5', 'Juventus'],
    ['6', 'Paris Saint-Germain'],
    ['7', 'LIVE'],
    ['8', 'period1'],
    ['15', 'PRE'],
    ['16', 'REMOVED'],
  ]);

  const interval = 1000;
  const duration = 5000;

  beforeEach(() => {
    oddsLoader = new OddsLoader({ logger }, { rootPath: 'http://example.com' });
    mappingsLoader = new MappingsLoader({ logger }, { rootPath: 'http://example.com' });
    const eventValidator = new EventValidator();
    sportEventProcessor = new SportEventTransformer({ eventValidator, logger });
    stateManager = new StateManager();

    eventProcessor = new EventProcessor({
      oddsLoader,
      mappingsLoader,
      sportEventProcessor,
      stateManager,
      logger,
    });

    vi.resetAllMocks();
  });

  describe('startFetching', () => {
    it('should start fetching data at intervals and stop after the duration', async () => {
      vi.useFakeTimers();

      vi.spyOn(oddsLoader, 'fetchOdds').mockResolvedValue(oddsMockedData);
      vi.spyOn(mappingsLoader, 'fetchMappings').mockResolvedValue(mappingsMockedData);
      const updateStateSpy = vi.spyOn(stateManager, 'updateState');
      const resetStateSpy = vi.spyOn(stateManager, 'resetState');

      eventProcessor.startFetching(interval, duration);

      await vi.advanceTimersByTimeAsync(4000);
      expect(updateStateSpy).toHaveBeenCalledTimes(4);

      await vi.advanceTimersByTimeAsync(1000);
      expect(updateStateSpy).toHaveBeenCalledTimes(4);

      await vi.advanceTimersByTimeAsync(1000);

      expect(resetStateSpy).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should log a warning and not start a new interval if fetching is already running', () => {
      vi.useFakeTimers();

      const loggerWarnSpy = vi.spyOn(logger, 'warn');

      eventProcessor.startFetching(interval, duration);
      eventProcessor.startFetching(interval, duration);

      expect(loggerWarnSpy).toHaveBeenCalledWith('Fetching is already running.');

      vi.useRealTimers();
    });

    it('should log and continue fetching data if an error occurs', async () => {
      vi.useFakeTimers();

      vi.spyOn(oddsLoader, 'fetchOdds').mockRejectedValue(new Error('Failed to fetch odds data'));
      vi.spyOn(mappingsLoader, 'fetchMappings').mockResolvedValue(mappingsMockedData);
      const consoleErrorSpy = vi.spyOn(logger, 'error');

      eventProcessor.startFetching(interval, duration);

      await vi.advanceTimersByTimeAsync(6000);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error running event processor:',
        'Failed to fetch or process data: Failed to fetch odds data',
      );

      vi.useRealTimers();
    });

    it('should reset state and clear cache after the simulation period', async () => {
      vi.useFakeTimers();

      vi.spyOn(oddsLoader, 'fetchOdds').mockResolvedValue(oddsMockedData);
      vi.spyOn(mappingsLoader, 'fetchMappings').mockResolvedValue(mappingsMockedData);
      const resetStateSpy = vi.spyOn(stateManager, 'resetState');
      const clearCacheSpy = vi.spyOn(mappingsLoader, 'clearCache');

      eventProcessor.startFetching(interval, duration);

      await vi.advanceTimersByTimeAsync(5000);

      expect(resetStateSpy).toHaveBeenCalledTimes(1);
      expect(clearCacheSpy).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('getFilteredState', () => {
    it('should return the filtered state', () => {
      const filteredState = eventProcessor.getFilteredState();

      expect(filteredState).toEqual({});
    });
  });
});
