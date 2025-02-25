import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OddsLoader, logger } from '../src/infra';

vi.mock('axios');

describe('OddsLoader', () => {
  let dataLoader: OddsLoader;

  beforeEach(() => {
    dataLoader = new OddsLoader({ logger }, { rootPath: 'http://localhost:3000/state' });

    vi.resetAllMocks();
  });

  it('should throw error when odds data is invalid', async () => {
    const mockResponse = {
      data: {},
    };

    (axios.get as any).mockResolvedValue(mockResponse);

    await expect(dataLoader.fetchOdds()).rejects.toThrow('Invalid or missing odds data in response');
  });

  it('should skip empty events', async () => {
    const mockResponse = {
      data: {
        odds: '\n',
      },
    };

    (axios.get as any).mockResolvedValue(mockResponse);

    const result = await dataLoader.fetchOdds();

    expect(result).toEqual([]);
  });

  it('should log error when mapping event fails', async () => {
    const mockResponse = {
      data: {
        odds: '1,2,3,4,5,6,7,8@1:\n9,10,11,12,13,14',
      },
    };

    (axios.get as any).mockResolvedValue(mockResponse);

    try {
      const result = await dataLoader.fetchOdds();
    } catch (error) {
      expect(error.message).toContain('Error mapping odds event: 9,10,11,12,13,14');
    }
  });

  it('should fetch data', async () => {
    const mockResponse = {
      data: {
        odds: '1,2,3,4,5,6,7,8@1:2\n9,10,11,12,13,14,15',
      },
    };

    (axios.get as any).mockResolvedValue(mockResponse);

    const result = await dataLoader.fetchOdds();

    expect(result).toEqual([
      {
        sportEventId: '1',
        sportId: '2',
        competitionId: '3',
        startTime: '4',
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
        sportEventId: '9',
        sportId: '10',
        competitionId: '11',
        startTime: '12',
        homeCompetitorId: '13',
        awayCompetitorId: '14',
        sportEventStatusId: '15',
        scores: [],
      },
    ]);
  });
});
