import { beforeEach, describe, expect, it, vi, test } from 'vitest';
import { EventValidator } from '../src/infra';

describe('EventValidator', () => {
  const eventValidator = new EventValidator();

  const oddsEvent = {
    sportEventId: 'event-id-1',
    sportId: '2',
    competitionId: '3',
    startTime: '1709900432183',
    homeCompetitorId: '5',
    awayCompetitorId: '6',
    sportEventStatusId: '7',
    scores: [],
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return false if required fields are missing', () => {
    const result = eventValidator.isValidEvent(oddsEvent);

    expect(result).toBe(true);
  });

  const keys: (keyof typeof oddsEvent)[] = [
    'sportEventId',
    'sportId',
    'competitionId',
    'startTime',
    'homeCompetitorId',
    'awayCompetitorId',
    'sportEventStatusId',
  ];

  test.each(keys.map((key) => [key]))('should return false if %s is missing', (key) => {
    const invalidEvent = { ...oddsEvent };
    delete invalidEvent[key];

    const result = eventValidator.isValidEvent(invalidEvent);

    expect(result).toBe(false);
  });

  it('should return false if sportEventStatusId is LIVE and scores are missing', () => {
    const invalidEvent = { ...oddsEvent, sportEventStatusId: 'LIVE' };

    const result = eventValidator.isValidEvent(invalidEvent);

    expect(result).toBe(false);
  });

  it('should return false if scores are invalid', () => {
    const invalidEvent = { ...oddsEvent, scores: [{ period: '8', home_score: '9', away_score: '' }] };

    const result = eventValidator.isValidEvent(invalidEvent);

    expect(result).toBe(false);
  });

  it('should return true if odds object and it scores are valid', () => {
    const validEvent = { ...oddsEvent, scores: [{ period: '8', home_score: '9', away_score: '10' }] };

    const result = eventValidator.isValidEvent(validEvent);

    expect(result).toBe(true);
  });
});
