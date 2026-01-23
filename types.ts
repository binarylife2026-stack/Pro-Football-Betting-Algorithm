
export type SportType = 'Football' | 'Cricket' | 'Hockey' | 'Basketball' | 'Tennis' | 'Table Tennis' | 'Baseball';

export interface MatchData {
  sport: SportType;
  homeTeamName: string;
  awayTeamName: string;
  additionalContext?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PredictionResponse {
  text: string;
  sources: GroundingSource[];
}
