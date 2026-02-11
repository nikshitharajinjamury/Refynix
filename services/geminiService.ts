
import { GoogleGenAI, Type } from "@google/genai";
import { ReviewResult, Category, Severity } from "../types";

const REVIEW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the code review." },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, enum: Object.values(Category) },
          severity: { type: Type.STRING, enum: Object.values(Severity) },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          line: { type: Type.INTEGER },
          suggestion: { type: Type.STRING }
        },
        required: ["id", "category", "severity", "title", "description", "line", "suggestion"]
      }
    },
    optimizedCode: { type: Type.STRING, description: "Full optimized source code." },
    scores: {
      type: Type.OBJECT,
      properties: {
        security: { type: Type.INTEGER },
        performance: { type: Type.INTEGER },
        maintainability: { type: Type.INTEGER },
        quality: { type: Type.INTEGER }
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
};

export async function analyzeCode(code: string, language: string, instruction?: string): Promise<ReviewResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY is missing. Please create a .env file with API_KEY=your_key");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are a Senior Software Architect.
    Conduct a deep review of the provided code.
    Detect bugs, security vulnerabilities, and performance bottlenecks.
    Return results strictly in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${language}. Code:\n${code}${instruction ? `\nRequest: ${instruction}` : ''}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: REVIEW_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return JSON.parse(response.text || '{}') as ReviewResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}
