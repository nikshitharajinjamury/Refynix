
import { ReviewResult } from "../types";

/**
 * REFINYX GROQ GATEWAY
 * Powered by Groq LPU™ Inference Engine for ultra-low latency architectural analysis.
 */
export async function analyzeCode(code: string, language: string, instruction?: string): Promise<ReviewResult> {
  try {
    const token = localStorage.getItem('refinyx_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code,
        language,
        instruction
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Analysis failed via Backend.");
    }

    return await response.json();
  } catch (error) {
    console.error("Refynix Backend Error:", error);
    throw error;
  }
}
