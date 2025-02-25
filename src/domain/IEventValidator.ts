import { OddsEventData, ScorePeriod } from '../types/types';

export interface IEventValidator {
  isValidEvent(event: Partial<OddsEventData>): boolean;
}
