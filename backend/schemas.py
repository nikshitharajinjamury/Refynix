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
