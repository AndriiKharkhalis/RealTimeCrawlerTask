import { OddsEventData } from '../types/types';

export interface IOddsLoader {
  fetchOdds(): Promise<OddsEventData[]>;
}
