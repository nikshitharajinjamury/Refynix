
import { ReviewResult } from "../types";

/**
 * REFINYX GROQ GATEWAY
 * Powered by Groq LPU™ Inference Engine for ultra-low latency architectural analysis.
 */
export async function analyzeCode(code: string, language: string, instruction?: string): Promise<ReviewResult> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Groq API Key (process.env.API_KEY) is missing.");
  }

  const systemInstruction = `
    REFINYX ARCHITECT MODE.
    You are the core intelligence of Refinyx, powered by Groq Llama 3.3. Analyze the code for logic, security, and performance.
    
    CRITICAL: You MUST return a valid JSON object matching the requested schema.
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `${systemInstruction}\n\nSchema:\n{
              "summary": "string",
              "optimizedCode": "string",
              "issues": [{"id": "string", "category": "string", "severity": "string", "title": "string", "description": "string", "line": 0, "suggestion": "string"}],
              "scores": {"security": 0, "performance": 0, "maintainability": 0, "quality": 0},
              "impacts": [{"metric": "string", "before": 0, "after": 0, "unit": "string", "improvement": "string"}]
            }`
          },
          {
            role: 'user',
            content: `Language: ${language}\nCode:\n${code}${instruction ? `\nRequirement: ${instruction}` : ""}`
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq Analysis failed.");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) throw new Error("Empty response from Groq engine");
    
    return JSON.parse(content) as ReviewResult;
  } catch (error) {
    console.error("Refinyx Groq Analysis Error:", error);
    throw error;
  }
}
