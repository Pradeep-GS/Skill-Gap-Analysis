from datetime import datetime
from fastapi import HTTPException
from app.database import get_collection
from app.utils.helpers import to_object_id, serialize_document
from app.services.groq_service import extract_skills


def create_job(role_name: str, company_name: str, job_description_text: str,
               experience_required: str = None) -> dict:
    if not job_description_text or not job_description_text.strip():
        raise HTTPException(status_code=400, detail="Job description text is empty.")

    required_skills = extract_skills(job_description_text)

    document = {
        "role_name": role_name,
        "company_name": company_name,
        "job_description_text": job_description_text,
        "required_skills": required_skills,
        "experience_required": experience_required,
        "created_at": datetime.utcnow(),
    }

    try:
        collection = get_collection("jobs")
        result = collection.insert_one(document)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while saving job: {exc}") from exc

    document["_id"] = result.inserted_id
    return serialize_document(document)


def get_job(job_id: str) -> dict:
    collection = get_collection("jobs")
    try:
        doc = collection.find_one({"_id": to_object_id(job_id)})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while fetching job: {exc}") from exc

    if not doc:
        raise HTTPException(status_code=404, detail=f"Job with id '{job_id}' not found.")
    return serialize_document(doc)


def list_jobs() -> list:
    collection = get_collection("jobs")
    try:
        docs = list(collection.find().sort("created_at", -1))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while listing jobs: {exc}") from exc
    return [serialize_document(d) for d in docs]
