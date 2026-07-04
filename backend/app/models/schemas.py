from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


# ---------- Auth ----------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str  # "hr" or "candidate"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------- Job Description ----------

class JobDescriptionCreate(BaseModel):
    role_name: str
    company_name: str
    job_description_text: Optional[str] = None
    experience_required: Optional[str] = None


class JobDescriptionResponse(BaseModel):
    id: str
    role_name: str
    company_name: str
    job_description_text: str
    required_skills: List[str] = []
    experience_required: Optional[str] = None
    hr_id: Optional[str] = None
    hr_name: Optional[str] = None
    hr_email: Optional[str] = None
    created_at: datetime


# ---------- Candidate ----------

class CandidateCreate(BaseModel):
    name: str
    email: EmailStr


class CandidateResponse(BaseModel):
    id: str
    name: str
    email: str
    resume_text: str
    extracted_skills: List[str] = []
    uploaded_at: datetime


# ---------- Analysis ----------

class AnalyzeRequest(BaseModel):
    job_id: str


class AnalysisResult(BaseModel):
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[str] = []
    roadmap: List[str] = []


class AnalysisResponse(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[str] = []
    roadmap: List[str] = []
    match_score: float
    match_category: str
    created_at: datetime


class ErrorResponse(BaseModel):
    detail: str
