import os
import json
from typing import Optional
from groq import Groq
from dotenv import load_dotenv
from models import ReviewResult
from visualizer import VisualizationModule

load_dotenv()

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        self.client = Groq(api_key=self.api_key)
        self.visualizer = VisualizationModule()

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
          "impacts": [{"metric": "string", "before": 0, "after": 0, "unit": "string", "improvement": "string"}],
          "timeComplexity": "string", // e.g., O(n), O(log n)
          "spaceComplexity": "string" // e.g., O(1), O(n)
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

            # Generate Visualizations
            metrics = self.visualizer.extract_metrics(code, data.get("optimizedCode", code), language)
            flowchart = self.visualizer.generate_mermaid_flowchart(code, data.get("optimizedCode", code))
            plotly_json = self.visualizer.generate_plotly_json(metrics)
            ast_comparison = self.visualizer.generate_ast_comparison(code, data.get("optimizedCode", code), language)
            efficiency_score = self.visualizer.calculate_efficiency_score(metrics)

            result = ReviewResult.model_validate(data)
            result.visualizations = {
                "metrics": metrics,
                "flowchart": flowchart,
                "plotly": plotly_json,
                "ast": ast_comparison,
                "efficiencyScore": efficiency_score
            }

            return result


        except Exception as e:
            print(f"Error in Groq analysis: {e}")
            raise e

    async def generate_test_cases(self, code: str, language: str) -> dict:
        system_instruction = """
        You are an expert QA engineer. Generate comprehensive test cases for the provided code.
        Focus on edge cases, boundary values, and potential failure scenarios.
        
        CRITICAL: Return a valid JSON object matching the schema:
        {
            "test_cases": [
                {"description": "string", "input": "string", "expected_output": "string"}
            ]
        }
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"Language: {language}\nCode:\n{code}"}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Error generating test cases: {e}")
            raise e

    async def run_tests(self, code: str, language: str, test_cases: list) -> dict:
        system_instruction = """
        You are a Code Execution Simulator. accurately simulate the execution of the provided code against the test cases.
        
        CRITICAL: Return a valid JSON object matching the schema:
        {
            "results": [
                {"description": "string", "passed": boolean, "actual_output": "string", "error": "string (optional)"}
            ]
        }
        """
        
        user_content = f"Language: {language}\nCode:\n{code}\n\nTest Cases:\n{json.dumps(test_cases)}"

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_content}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Error executing tests: {e}")
            raise e

    async def generate_interview_questions(self, topic: str, level: str, count: int = 5) -> dict:
        system_instruction = f"""
        You are a technical interviewer. Generate {count} unique and challenging interview questions based on the topic.
        Include a mix of conceptual and practical questions.
        
        CRITICAL: Return a valid JSON object matching the schema:
        {{
            "questions": [
                {{
                    "id": 1,
                    "question": "string",
                    "options": ["A", "B", "C", "D"], // Optional, for multiple choice
                    "answer": "string",
                    "explanation": "string",
                    "difficulty": "Easy" | "Medium" | "Hard"
                }}
            ]
        }}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"Topic: {topic}\nLevel: {level}"}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Error generating interview questions: {e}")
            raise e

    async def ask_interview_question(self, topic: str, question: str, context: Optional[str] = None) -> dict:
        system_instruction = """
        You are an expert technical mentor. Answer the user's question clearly and concisely.
        Provide code examples where relevant.
        """
        
        user_content = f"Topic: {topic}\nQuestion: {question}"
        if context:
            user_content += f"\nContext: {context}"

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_content}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.5
            )
            return {"answer": chat_completion.choices[0].message.content}
        except Exception as e:
            print(f"Error answering interview question: {e}")
            raise e

