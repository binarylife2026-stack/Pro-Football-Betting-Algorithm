
import { GoogleGenAI } from "@google/genai";
import { MatchData, PredictionResponse, GroundingSource } from "../types";

export const analyzeMatch = async (data: MatchData): Promise<PredictionResponse> => {
  // Initialize with the API key from process.env.API_KEY as required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Professional Football Data Analyst and Betting Algorithm.
    Perform a search for the upcoming match: ${data.homeTeamName} vs ${data.awayTeamName}.
    
    RESEARCH TASKS:
    1. Find the Last 5 matches form for both teams.
    2. Find the Last 5 Head-to-Head results.
    3. Check for recent injuries or suspensions (especially top scorers or defenders).
    4. Find average team stats: Corners, Yellow Cards, and Shots on Target (SOT).
    5. Consider any additional context provided: ${data.additionalContext || 'None'}.

    TACTICAL LOGIC RULES:
    - If a team has >60% possession avg, favor them for "Corner Win."
    - If a team has a "High Press" style and a "Lenient Referee," favor "Under" on Yellow Cards.
    - If a team's top striker/attacking key player is injured, decrease "SOT Win" probability.

    PREDICTION CATEGORIES REQUIRED:
    1. Match Result (1, X, 2)
    2. Double Chance (1X, 12, X2)
    3. Corner Win (Home, Away, or Draw)
    4. Corner Double Chance (1X, 12, X2)
    5. Yellow Card Win (Home, Away, or Draw)
    6. Yellow Card Double Chance (1X, 12, X2)
    7. Shots on Target (SOT) Win (Home, Away, or Draw)
    8. Shots on Target (SOT) Double Chance (1X, 12, X2)

    OUTPUT FORMAT:
    1. Provide a clean Markdown table with these columns: Category | Prediction.
    2. Provide a detailed "Analyst's Tactical Reasoning" section.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      // Use string prompt directly for contents
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // thinkingConfig is supported for gemini-3 models
        thinkingConfig: { thinkingBudget: 24000 },
        temperature: 0.2,
      }
    });
    
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      // Access text as a property, not a method
      text: response.text || "Analysis failed.",
      sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()) // Deduplicate sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("The algorithm encountered a network error. Ensure the team names are correct.");
  }
};
