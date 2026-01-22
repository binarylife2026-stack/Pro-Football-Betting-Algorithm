
export interface MatchData {
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
