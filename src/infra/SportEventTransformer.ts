import { IEventValidator, ILogger, ISportEventTransformer, SportEventTransformerRequest } from '../domain';
import { CompetitorType, EventStatus, Score, SportEvent } from '../types/types';

export type SportEventTransformerDependencies = {
  eventValidator: IEventValidator;
  logger: ILogger;
};

export class SportEventTransformer implements ISportEventTransformer {
  constructor(private $: SportEventTransformerDependencies) {}

  transform(req: SportEventTransformerRequest): SportEvent[] {
    const sportEvents: SportEvent[] = [];
    const { oddsData, mappingsData } = req;

    for (const oddsEvent of oddsData) {
      if (!this.$.eventValidator.isValidEvent(oddsEvent)) {
        this.$.logger.warn(`Skipping invalid event: `, { oddsEvent });
        continue;
      }

      try {
        const mappedValues = this.mapEventFields(mappingsData, {
          status: oddsEvent.sportEventStatusId,
          sport: oddsEvent.sportId,
          competition: oddsEvent.competitionId,
          homeCompetitor: oddsEvent.homeCompetitorId,
          awayCompetitor: oddsEvent.awayCompetitorId,
        });

        const sportEvent: SportEvent = {
          id: oddsEvent.sportEventId,
          status: mappedValues.status as EventStatus,
          scores:
            mappedValues.status !== EventStatus.PRE
              ? oddsEvent.scores.reduce(
                  (acc, score) => {
                    const periodKey = this.getMappingValue(mappingsData, score.period, 'period');
                    acc[periodKey] = {
                      type: periodKey,
                      home: score.home_score,
                      away: score.away_score,
                    };
                    return acc;
                  },
                  {} as Record<string, Score>,
                )
              : {},
          startTime: new Date(parseInt(oddsEvent.startTime)).toISOString(),
          sport: mappedValues.sport,
          competitors: {
            HOME: {
              type: CompetitorType.HOME,
              name: mappedValues.homeCompetitor,
            },
            AWAY: {
              type: CompetitorType.AWAY,
              name: mappedValues.awayCompetitor,
            },
          },
          competition: mappedValues.competition,
        };

        sportEvents.push(sportEvent);
      } catch (error) {
        this.$.logger.error(`Error processing event: ${oddsEvent.sportEventId}`, {
          oddsEvent,
          error: error.message,
        });
      }
    }

    return sportEvents;
  }

  private mapEventFields(
    mappingsData: Map<string, string>,
    fields: Record<string, string>,
  ): Record<string, string> {
    return Object.entries(fields).reduce(
      (acc, [key, mappingField]) => {
        acc[key] = this.getMappingValue(mappingsData, mappingField, key);
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  private getMappingValue(mappingsData: Map<string, string>, key: string, field: string): string {
    const value = mappingsData.get(key);
    if (!value) {
      throw new Error(`Mapping not found for ${field} with key: ${key}`);
    }
    return value;
  }
}
