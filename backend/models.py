from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    google_id = Column(String, nullable=True)


class CodeRequest(BaseModel):
    code: str
    language: str
    instruction: Optional[str] = None

class CodeIssue(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    description: str
    line: int
    suggestion: str

class ImpactAssessment(BaseModel):
    metric: str
    before: float
    after: float
    unit: str
    improvement: str

class ReviewScores(BaseModel):
    security: int
    performance: int
    maintainability: int
    quality: int

class ReviewResult(BaseModel):
    summary: str
    optimizedCode: str
    issues: List[CodeIssue]
    scores: ReviewScores
    impacts: List[ImpactAssessment]
    timeComplexity: str = "N/A"
    spaceComplexity: str = "N/A"
    visualizations: Optional[Dict[str, Any]] = None

class ReviewHistory(Base):
    __tablename__ = "review_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # ForeignKey would be better but keeping it simple for now to avoid relationship complexity
    code = Column(String)
    language = Column(String)
    result = Column(String) # Store JSON string of ReviewResult
    timestamp = Column(String) # Store ISO format timestamp
