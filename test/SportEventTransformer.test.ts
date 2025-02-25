import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventValidator, logger, SportEventTransformer } from '../src/infra';

describe('DataProcessor', () => {
  let eventValidator: EventValidator;
  let dataProcessor: SportEventTransformer;

  const mappingsData = new Map([
    ['1', 'sport1'],
    ['2', 'sport2'],
    ['3', 'competition1'],
    ['4', '2021-01-01T00:00:00Z'],
    ['5', 'team1'],
    ['6', 'team2'],
    ['7', 'LIVE'],
    ['8', 'CURRENT'],
    ['10', 'sport4'],
    ['11', 'competition2'],
    ['12', '2021-01-02T00:00:00Z'],
    ['13', 'team3'],
    ['14', 'team4'],
    ['15', 'PRE'],
    ['16', 'period2'],
  ]);

  beforeEach(() => {
    eventValidator = new EventValidator();
    dataProcessor = new SportEventTransformer({ eventValidator, logger });

    vi.resetAllMocks();
  });

  it('should process data', () => {
    const oddsData = [
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
            home_score: '1',
            away_score: '2',
          },
        ],
      },
      {
        sportEventId: 'ivent-id-2',
        sportId: '10',
        competitionId: '11',
        startTime: '1719900032184',
        homeCompetitorId: '13',
        awayCompetitorId: '14',
        sportEventStatusId: '15',
        scores: [],
      },
    ];

    const result = dataProcessor.transform({ oddsData, mappingsData });

    expect(result).toEqual([
      {
        id: 'event-id-1',
        status: 'LIVE',
        scores: {
          CURRENT: {
            type: 'CURRENT',
            home: '1',
            away: '2',
          },
        },
        startTime: '2024-03-08T12:20:32.183Z',
        sport: 'sport2',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'team1',
          },
          AWAY: {
            type: 'AWAY',
            name: 'team2',
          },
        },
        competition: 'competition1',
      },
      {
        id: 'ivent-id-2',
        status: 'PRE',
        scores: {},
        startTime: '2024-07-02T06:00:32.184Z',
        sport: 'sport4',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'team3',
          },
          AWAY: {
            type: 'AWAY',
            name: 'team4',
          },
        },
        competition: 'competition2',
      },
    ]);
  });

  it('should throw error if mapping not found', () => {
    const oddsData = [
      {
        sportEventId: 'event-id-1',
        sportId: '20',
        competitionId: '3',
        startTime: '1709900432183',
        homeCompetitorId: '5',
        awayCompetitorId: '6',
        sportEventStatusId: '7',
        scores: [
          {
            period: '8',
            home_score: '1',
            away_score: '2',
          },
        ],
      },
    ];

    try {
      dataProcessor.transform({ oddsData, mappingsData });
    } catch (error) {
      expect(error.message).toEqual('Mapping not found for sport with key: 20');
    }
  });

  it('should log error and skip invalid event', () => {
    const oddsData = [
      {
        sportEventId: 'event-id-1',
        sportId: '',
        competitionId: '3',
        startTime: '1709900432183',
        homeCompetitorId: '5',
        awayCompetitorId: '6',
        sportEventStatusId: '7',
        scores: [
          {
            period: '8',
            home_score: '1',
            away_score: '2',
          },
        ],
      },
      {
        sportEventId: 'ivent-id-2',
        sportId: '10',
        competitionId: '11',
        startTime: '1719900032184',
        homeCompetitorId: '13',
        awayCompetitorId: '14',
        sportEventStatusId: '15',
        scores: [],
      },
    ];

    try {
      dataProcessor.transform({ oddsData, mappingsData });
    } catch (error) {
      expect(error.message).toHaveBeenCalledWith(`Skipping invalid event: `, {
        oddsEvent: {
          sportEventId: 'event-id-1',
          sportId: '',
          competitionId: '3',
          startTime: '1709900432183',
          homeCompetitorId: '5',
          awayCompetitorId: '6',
          sportEventStatusId: '7',
          scores: [
            {
              period: '8',
              home_score: '1',
              away_score: '2',
            },
          ],
        },
      });

      expect(dataProcessor.transform({ oddsData, mappingsData })).toEqual([
        {
          id: 'ivent-id-2',
          status: 'PRE',
          scores: {},
          startTime: '2024-07-02T06:00:32.184Z',
          sport: 'sport4',
          competitors: {
            HOME: {
              type: 'HOME',
              name: 'team3',
            },
            AWAY: {
              type: 'AWAY',
              name: 'team4',
            },
          },
          competition: 'competition2',
        },
      ]);
    }
  });
});
