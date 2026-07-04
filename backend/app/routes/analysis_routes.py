from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest
from app.services.analysis_service import run_analysis, get_analysis

router = APIRouter(tags=["Analysis"])


@router.post("/analyze")
async def analyze(payload: AnalyzeRequest):
    if not payload.job_id or not payload.candidate_id:
        raise HTTPException(status_code=400, detail="job_id and candidate_id are required.")

    analysis = run_analysis(payload.job_id, payload.candidate_id)
    return {"message": "Analysis completed successfully.", "analysis": analysis}


@router.get("/analysis/{analysis_id}")
async def get_analysis_by_id(analysis_id: str):
    analysis = get_analysis(analysis_id)
    return {"analysis": analysis}
