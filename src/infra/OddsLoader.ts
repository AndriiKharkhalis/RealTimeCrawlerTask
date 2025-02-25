import axios from 'axios';
import { ILogger, IOddsLoader } from '../domain';
import { OddsEventData } from '../types/types';

export type OddsLoaderDependencies = {
  logger: ILogger;
};

export type OddsLoaderOptions = {
  rootPath: string;
};

export class OddsLoader implements IOddsLoader {
  constructor(
    private readonly $: OddsLoaderDependencies,
    private readonly options: OddsLoaderOptions,
  ) {}

  async fetchOdds(): Promise<OddsEventData[]> {
    const events: OddsEventData[] = [];

    try {
      const response = await axios.get(`${this.options.rootPath}/state`);

      if (!response.data || typeof response.data.odds !== 'string') {
        throw new Error('Invalid or missing odds data in response');
      }

      const data = response.data.odds.split('\n');

      for (const event of data) {
        if (!event) {
          this.$.logger.warn('Skipping empty event');
          continue;
        }

        const mappedOddsData = this.mapOddsData(event);

        if (mappedOddsData) {
          events.push(mappedOddsData);
        }
      }

      const filteredEvents = events.filter((event) => !!event);

      return filteredEvents;
    } catch (error) {
      throw new Error(`Failed to fetch odds data from ${this.options.rootPath}/state: ${error.message}`);
    }
  }

  private mapOddsData(event: string): OddsEventData | null {
    try {
      const fields = event.split(',');

      const sanitizedFields = fields.map((field) => field?.trim()).filter(Boolean);

      if (sanitizedFields.length < 7) {
        throw new Error(`Invalid odds event: ${event}`);
      }

      const scores = sanitizedFields[7]
        ? sanitizedFields[7].split('|').map((score) => {
            const [period, homeAway] = score.split('@');
            const [home_score, away_score] = homeAway.split(':');
            return { period, home_score, away_score };
          })
        : [];

      return {
        sportEventId: sanitizedFields[0],
        sportId: sanitizedFields[1],
        competitionId: sanitizedFields[2],
        startTime: sanitizedFields[3],
        homeCompetitorId: sanitizedFields[4],
        awayCompetitorId: sanitizedFields[5],
        sportEventStatusId: sanitizedFields[6],
        scores: scores,
      };
    } catch (error) {
      this.$.logger.error(`Error mapping odds event: `, {
        event,
        error: error.message,
      });
      return null;
    }
  }
}
