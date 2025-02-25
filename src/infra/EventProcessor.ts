import {
  IEventProcessor,
  ILogger,
  IMappingsLoader,
  IOddsLoader,
  ISportEventTransformer,
  IStateManager,
} from '../domain';
import { SportEvent } from '../types/types';

export type EventProcessorDependencies = {
  oddsLoader: IOddsLoader;
  mappingsLoader: IMappingsLoader;
  sportEventProcessor: ISportEventTransformer;
  stateManager: IStateManager;
  logger: ILogger;
};

export class EventProcessor implements IEventProcessor {
  private isFetching: boolean = false;
  private fetchInterval: NodeJS.Timeout | null = null;

  constructor(private readonly $: EventProcessorDependencies) {}

  async startFetching(interval: number, duration: number): Promise<void> {
    if (this.fetchInterval) {
      this.$.logger.warn('Fetching is already running.');
      return;
    }
    const endTime = Date.now() + duration;

    this.fetchInterval = setInterval(async () => {
      if (Date.now() >= endTime) {
        clearInterval(this.fetchInterval!);
        this.fetchInterval = null;

        this.resetForNextSimulation();
        this.$.logger.info('Simulation period completed. Ready for the next one.');

        setTimeout(() => {
          this.startFetching(interval, duration);
        }, interval);

        return;
      }

      if (this.isFetching) return;

      this.isFetching = true;
      try {
        await this.processEvents();
      } catch (error) {
        this.$.logger.error('Error running event processor:', error.message);
      } finally {
        this.isFetching = false;
      }
    }, interval);
  }

  getFilteredState(): Record<string, SportEvent> {
    return this.$.stateManager.getFilteredState();
  }

  private async processEvents(): Promise<void> {
    try {
      const oddsData = await this.$.oddsLoader.fetchOdds();

      if (!oddsData.length) {
        return;
      }

      const mappingsData = await this.$.mappingsLoader.fetchMappings();

      if (!mappingsData.size) {
        return;
      }

      const transformedEvents = this.$.sportEventProcessor.transform({ oddsData, mappingsData });

      this.$.stateManager.updateState(transformedEvents);
    } catch (error) {
      throw new Error(`Failed to fetch or process data: ${error.message}`);
    }
  }

  private resetForNextSimulation(): void {
    this.$.stateManager.resetState();
    this.$.mappingsLoader.clearCache();
    this.$.logger.info('State and cache cleared for the next simulation.');
  }
}
