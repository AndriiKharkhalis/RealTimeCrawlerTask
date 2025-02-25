import { OddsEventData, SportEvent } from '../types/types';

export type SportEventTransformerRequest = {
  oddsData: OddsEventData[];
  mappingsData: Map<string, string>;
};

export interface ISportEventTransformer {
  transform(req: SportEventTransformerRequest): SportEvent[];
}
