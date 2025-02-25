export enum EventStatus {
  PRE = 'PRE',
  LIVE = 'LIVE',
  REMOVED = 'REMOVED',
}

export enum CompetitorType {
  HOME = 'HOME',
  AWAY = 'AWAY',
}

export type Competitor = {
  type: CompetitorType;
  name: string;
};

export type Score = {
  type: string;
  home: string;
  away: string;
};

export type Scores = {
  [key: string]: Score;
};

export type SportEvent = {
  id: string;
  status: EventStatus;
  scores: Scores;
  startTime: string;
  sport: string;
  competitors: {
    HOME: Competitor;
    AWAY: Competitor;
  };
  competition: string;
};

export type State = Record<string, SportEvent>;

export type ScorePeriod = {
  period: string;
  home_score: string;
  away_score: string;
};

export type OddsEventData = {
  sportEventId: string;
  sportId: string;
  competitionId: string;
  startTime: string;
  homeCompetitorId: string;
  awayCompetitorId: string;
  sportEventStatusId: string;
  scores: ScorePeriod[];
};
