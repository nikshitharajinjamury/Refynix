from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from models import ReviewResult

class ReviewHistoryResponse(BaseModel):
    id: int
    code: str
    language: str
    result: ReviewResult
    timestamp: str

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_verified: bool

class VerifyEmail(BaseModel):
    email: EmailStr
    code: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class GoogleLogin(BaseModel):
    token: str

class TestCase(BaseModel):
    description: str
    input: str
    expected_output: str

class TestResponse(BaseModel):
    test_cases: List[TestCase]

class TestResult(BaseModel):
    description: str
    passed: bool
    actual_output: str
    error: Optional[str] = None

class TestRunRequest(BaseModel):
    code: str
    language: str
    test_cases: List[TestCase]

class TestRunResponse(BaseModel):
    results: List[TestResult]

class InterviewRequest(BaseModel):
    topic: str
    level: str = "Intermediate"
    count: int = 5

class QuestionRequest(BaseModel):
    topic: str
    question: str
    context: Optional[str] = None

class QuestionResponse(BaseModel):
    answer: str

class InterviewQuestion(BaseModel):
    id: int
    question: str
    options: Optional[List[str]] = None
    answer: str
    explanation: str
    difficulty: str

class InterviewResponse(BaseModel):
    questions: List[InterviewQuestion]
