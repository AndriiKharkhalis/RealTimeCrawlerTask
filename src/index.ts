import express from 'express';
import env from './confg/env';
import { EventProcessorFactory } from './factory';
import { logger } from './infra';

const app = express();

const fetchPort = env.RTC_SIMULATION_API_PORT;
const rootPath = env.RTC_SIMULATION_ROOT_PATH;
const duration = env.RTC_SIMULATION_DURATION_MIN;

const eventProcessorFactory = new EventProcessorFactory({
  rootPath: `http://localhost:${fetchPort}${rootPath}`,
});

const eventProcessor = eventProcessorFactory.createEventProcessor();

const interval = 1000;

eventProcessor.startFetching(interval, duration);

app.get('/state', async (req, res) => {
  try {
    const state = eventProcessor.getFilteredState();
    res.json(state);
  } catch (error) {
    logger.error('Error fetching state:', error.message);
    res.status(500).json({ error: 'Failed to fetch state', message: error.message });
  }
});

const appPort = 3001;

app.listen(appPort, () => {
  logger.info(`Server is running on http://localhost:${appPort}`);
});
