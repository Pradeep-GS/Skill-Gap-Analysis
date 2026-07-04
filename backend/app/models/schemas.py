from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


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
    candidate_id: str


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
