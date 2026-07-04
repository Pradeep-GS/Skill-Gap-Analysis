from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional
from app.utils.pdf_utils import extract_text_from_pdf
from app.utils.security import require_role, get_current_user
from app.services.job_service import create_job, get_job, list_jobs

router = APIRouter(tags=["Job Description"])


@router.post("/upload-job-description")
async def upload_job_description(
    role_name: str = Form(...),
    company_name: str = Form(...),
    experience_required: Optional[str] = Form(None),
    job_description_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role("hr")),
):
    """
    HR-only. Accepts either a plain text job description (job_description_text)
    or an uploaded PDF file. At least one must be provided.
    """
    if not role_name.strip() or not company_name.strip():
        raise HTTPException(status_code=400, detail="role_name and company_name are required.")

    final_text = None

    if file is not None:
        final_text = await extract_text_from_pdf(file)
    elif job_description_text and job_description_text.strip():
        final_text = job_description_text.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either a PDF file or job_description_text.",
        )

    job = create_job(
        role_name=role_name.strip(),
        company_name=company_name.strip(),
        job_description_text=final_text,
        experience_required=experience_required,
        hr_id=current_user["id"],
        hr_name=current_user["name"],
        hr_email=current_user["email"],
    )
    return {"message": "Job description uploaded successfully.", "job": job}


@router.get("/jobs")
async def get_all_jobs(current_user: dict = Depends(get_current_user)):
    """Any authenticated user (HR or candidate) can browse jobs."""
    jobs = list_jobs()
    return {"jobs": jobs}


@router.get("/jobs/{job_id}")
async def get_job_by_id(job_id: str, current_user: dict = Depends(get_current_user)):
    job = get_job(job_id)
    return {"job": job}
