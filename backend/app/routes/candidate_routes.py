from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.utils.pdf_utils import extract_text_from_pdf
from app.services.candidate_service import create_candidate, get_candidate, list_candidates

router = APIRouter(tags=["Candidate"])


@router.post("/upload-resume")
async def upload_resume(
    name: str = Form(...),
    email: str = Form(...),
    file: UploadFile = File(...),
):
    if not name.strip():
        raise HTTPException(status_code=400, detail="name is required.")
    if not email.strip():
        raise HTTPException(status_code=400, detail="email is required.")

    resume_text = await extract_text_from_pdf(file)

    candidate = create_candidate(
        name=name.strip(),
        email=email.strip(),
        resume_text=resume_text,
    )
    return {"message": "Resume uploaded successfully.", "candidate": candidate}


@router.get("/candidates")
async def get_all_candidates():
    candidates = list_candidates()
    return {"candidates": candidates}


@router.get("/candidates/{candidate_id}")
async def get_candidate_by_id(candidate_id: str):
    candidate = get_candidate(candidate_id)
    return {"candidate": candidate}
