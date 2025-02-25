import { IEventValidator } from '../../domain';
import { OddsEventData, ScorePeriod, EventStatus } from '../../types/types';

export class EventValidator implements IEventValidator {
  isValidEvent(oddsEvent: Partial<OddsEventData>): boolean {
    const {
      sportEventId,
      sportId,
      competitionId,
      startTime,
      homeCompetitorId,
      awayCompetitorId,
      sportEventStatusId,
      scores,
    } = oddsEvent;

    const requiredFields = [
      sportEventId,
      sportId,
      competitionId,
      startTime,
      homeCompetitorId,
      awayCompetitorId,
      sportEventStatusId,
    ];

    const hasRequiredFields = requiredFields.every(
      (field) => typeof field === 'string' && field.trim().length > 0,
    );

    if (!hasRequiredFields) {
      return false;
    }

    if (sportEventStatusId === EventStatus.LIVE && (!Array.isArray(scores) || scores.length === 0)) {
      return false;
    }

    if (Array.isArray(scores) && scores.length > 0) {
      const isValidScores = scores.every((score) => this.isValidScorePeriod(score));

      if (!isValidScores) {
        return false;
      }
    }

    return true;
  }

  private isValidScorePeriod(score: ScorePeriod): boolean {
    const { away_score, home_score, period } = score;

    const requiredFields = [away_score, home_score, period];

    return requiredFields.every((field) => typeof field === 'string' && field.trim().length > 0);
  }
}
