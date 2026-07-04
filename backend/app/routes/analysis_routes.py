from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import AnalyzeRequest
from app.services.analysis_service import run_analysis, get_analysis
from app.utils.security import require_role, get_current_user

router = APIRouter(tags=["Analysis"])


@router.post("/analyze")
async def analyze(payload: AnalyzeRequest, current_user: dict = Depends(require_role("candidate"))):
    """Candidate-only. Runs the analysis using the logged-in candidate's own resume."""
    if not payload.job_id:
        raise HTTPException(status_code=400, detail="job_id is required.")

    analysis = run_analysis(payload.job_id, current_user["id"])
    return {"message": "Analysis completed successfully.", "analysis": analysis}


@router.get("/analysis/{analysis_id}")
async def get_analysis_by_id(analysis_id: str, current_user: dict = Depends(get_current_user)):
    analysis = get_analysis(analysis_id)
    return {"analysis": analysis}
