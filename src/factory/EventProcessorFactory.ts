import { IEventProcessor, IEventProcessorFactory } from '../domain';
import {
  EventProcessor,
  EventValidator,
  logger,
  MappingsLoader,
  OddsLoader,
  SportEventTransformer,
  StateManager,
} from '../infra';

export type EventProcessorFactoryOptions = {
  rootPath: string;
};

export class EventProcessorFactory implements IEventProcessorFactory {
  constructor(private readonly options: EventProcessorFactoryOptions) {}

  createEventProcessor(): IEventProcessor {
    const oddsLoader = new OddsLoader({ logger }, { rootPath: this.options.rootPath });
    const mappingsLoader = new MappingsLoader({ logger }, { rootPath: this.options.rootPath });
    const eventValidator = new EventValidator();
    const sportEventProcessor = new SportEventTransformer({ eventValidator, logger });
    const stateManager = new StateManager();

    return new EventProcessor({
      oddsLoader,
      mappingsLoader,
      sportEventProcessor,
      stateManager,
      logger,
    });
  }
}
