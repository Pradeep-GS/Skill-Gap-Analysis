from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.utils.pdf_utils import extract_text_from_pdf
from app.utils.security import require_role, get_current_user
from app.services.candidate_service import (
    upsert_candidate,
    get_candidate,
    get_candidate_by_user_id,
    list_candidates,
)

router = APIRouter(tags=["Candidate"])


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("candidate")),
):
    """Candidate-only. Uploads/replaces the resume tied to the logged-in account."""
    resume_text = await extract_text_from_pdf(file)

    candidate = upsert_candidate(
        user_id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        resume_text=resume_text,
    )
    return {"message": "Resume uploaded successfully.", "candidate": candidate}


@router.get("/candidates/me")
async def get_my_candidate_profile(current_user: dict = Depends(require_role("candidate"))):
    candidate = get_candidate_by_user_id(current_user["id"])
    return {"candidate": candidate}


@router.get("/candidates")
async def get_all_candidates(current_user: dict = Depends(require_role("hr"))):
    candidates = list_candidates()
    return {"candidates": candidates}


@router.get("/candidates/{candidate_id}")
async def get_candidate_by_id(candidate_id: str, current_user: dict = Depends(get_current_user)):
    candidate = get_candidate(candidate_id)
    return {"candidate": candidate}
