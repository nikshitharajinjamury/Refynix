
import { GoogleGenAI, Type } from "@google/genai";
import { ReviewResult } from "../types";

/**
 * REFINYX AI GATEWAY
 * Powered by Gemini 3 Pro for advanced architectural analysis.
 */
export async function analyzeCode(code: string, language: string, instruction?: string): Promise<ReviewResult> {
  // Use API key from process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key (process.env.API_KEY) is missing.");
  }

  // Initialize Gemini client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    REFINYX ARCHITECT MODE.
    You are the core intelligence of Refinyx. Analyze the code for logic, security, and performance.
    
    CRITICAL: You MUST return a valid JSON object matching the requested schema.
  `;

  try {
    // Correct usage: ai.models.generateContent with model and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Language: ${language}\nCode:\n${code}${instruction ? `\nRequirement: ${instruction}` : ""}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            optimizedCode: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  line: { type: Type.NUMBER },
                  suggestion: { type: Type.STRING }
                },
                required: ["id", "category", "severity", "title", "description", "line", "suggestion"]
              }
            },
            scores: {
              type: Type.OBJECT,
              properties: {
                security: { type: Type.NUMBER },
                performance: { type: Type.NUMBER },
                maintainability: { type: Type.NUMBER },
                quality: { type: Type.NUMBER }
              },
              required: ["security", "performance", "maintainability", "quality"]
            },
            impacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  before: { type: Type.NUMBER },
                  after: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  improvement: { type: Type.STRING }
                },
                required: ["metric", "before", "after", "unit", "improvement"]
              }
            }
          },
          required: ["summary", "issues", "optimizedCode", "scores", "impacts"]
        }
      }
    });

    // Access .text property directly as per guidelines
    const content = response.text;
    if (!content) throw new Error("Empty response from Gemini engine");
    
    return JSON.parse(content) as ReviewResult;
  } catch (error) {
    console.error("Refinyx Gemini Analysis Error:", error);
    throw error;
  }
}
