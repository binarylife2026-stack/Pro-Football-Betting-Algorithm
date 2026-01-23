
import { GoogleGenAI } from "@google/genai";
import { MatchData, PredictionResponse, GroundingSource, SportType } from "../types";

const getSportSpecificCategories = (sport: SportType): string[] => {
  switch (sport) {
    case 'Cricket':
      return ['Match Winner', 'Highest Opening Partnership', 'Total Sixes (O/U)', 'Top Wicket Taker', 'Most Fours', '1st Over Runs', 'Man of the Match', 'Toss Winner'];
    case 'Basketball':
      return ['Match Winner', 'Spread (Handicap)', 'Total Points (O/U)', 'First Half Winner', 'Player Points (O/U)', 'Total Rebounds', 'Total Assists', '3-Pointers Made'];
    case 'Tennis':
      return ['Match Winner', 'Set Betting', 'Total Games (O/U)', 'Handicap Games', 'First Set Winner', 'Total Aces', 'Total Double Faults', 'Tiebreak in Match'];
    case 'Hockey':
      return ['Match Winner', 'Total Goals (O/U)', 'Puck Line', 'First Period Winner', 'Most Penalties', 'Shots on Goal (O/U)', 'Power Play Goals', 'Save Percentage Prediction'];
    case 'Baseball':
      return ['Match Winner', 'Run Line', 'Total Runs (O/U)', 'First 5 Innings Winner', 'Total Strikeouts', 'Hits+Runs+Errors', 'Home Runs (O/U)', 'Stolen Bases'];
    case 'Table Tennis':
      return ['Match Winner', 'Set Handicap', 'Total Points (O/U)', 'First Set Winner', 'Correct Score (Sets)', 'Total Points Home', 'Total Points Away', 'Point Handicap'];
    default: // Football
      return ['Match Result (1X2)', 'Double Chance', 'Corner Win', 'Corner Double Chance', 'Yellow Card Win', 'Yellow Card Double Chance', 'Shots on Target Win', 'SOT Double Chance'];
  }
};

export const analyzeMatch = async (data: MatchData): Promise<PredictionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const categories = getSportSpecificCategories(data.sport);
  
  const prompt = `
    Act as a Professional Multi-Sport Data Analyst and Advanced Betting Algorithm.
    Perform a deep search for the upcoming ${data.sport} match: ${data.homeTeamName} vs ${data.awayTeamName}.
    
    RESEARCH TASKS:
    1. Find the latest 5 matches form, head-to-head records, and injury reports.
    2. Check ${data.sport}-specific news (e.g., Pitch report for Cricket, Starting Pitcher for Baseball, surface for Tennis).
    3. Analyze key metrics relevant to ${data.sport}.
    4. Consider extra context: ${data.additionalContext || 'None'}.

    REQUIRED OUTPUT FORMAT:
    You MUST start your response with "PREDICTIONS_START" and end with "PREDICTIONS_END".
    Inside that section, list exactly 8 lines, one for each category below, formatted strictly as:
    Category: [Prediction] | Confidence: [Percentage]%

    Categories to analyze for ${data.sport}:
    ${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

    After "PREDICTIONS_END", provide a detailed "Analyst's Tactical Reasoning" section in professional language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32000 },
        temperature: 0.1,
      }
    });
    
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return {
      text: response.text || "Analysis failed.",
      sources: Array.from(new Map(sources.map(s => [s.uri, s])).values())
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Algorithm error. Please verify team names and try again.");
  }
};
