import os
import json
from typing import Optional
from groq import Groq
from dotenv import load_dotenv
from models import ReviewResult

load_dotenv()

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        self.client = Groq(api_key=self.api_key)

    async def analyze_code(self, code: str, language: str, instruction: Optional[str] = None) -> ReviewResult:
        system_instruction = """
        REFINYX ARCHITECT MODE.
        You are the core intelligence of Refynix, powered by Groq Llama 3.3. Analyze the code for logic, security, and performance.
        
        CRITICAL: You MUST return a valid JSON object matching the requested schema.
        Ensure that 'issues', 'scores', and 'impacts' are populated realistically based on the analysis.
        """
        
        user_content = f"Language: {language}\nCode:\n{code}"
        if instruction:
            user_content += f"\nRequirement: {instruction}"

        user_content += """
        
        Schema to follow:
        {
          "summary": "string",
          "optimizedCode": "string",
          "issues": [{"id": "string", "category": "string", "severity": "string", "title": "string", "description": "string", "line": 0, "suggestion": "string"}],
          "scores": {"security": 0, "performance": 0, "maintainability": 0, "quality": 0},
          "impacts": [{"metric": "string", "before": 0, "after": 0, "unit": "string", "improvement": "string"}]
        }
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_instruction
                    },
                    {
                        "role": "user",
                        "content": user_content
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            content = chat_completion.choices[0].message.content
            if not content:
                raise ValueError("Empty response from Groq engine")
            
            # Sanitize JSON: Cast scores to int to avoid validation errors
            import json
            data = json.loads(content)
            if "scores" in data:
                for key in ["security", "performance", "maintainability", "quality"]:
                    if key in data["scores"]:
                        data["scores"][key] = int(data["scores"][key])

            return ReviewResult.model_validate(data)

        except Exception as e:
            print(f"Error in Groq analysis: {e}")
            raise e
