from datetime import datetime
from fastapi import HTTPException
from app.database import get_collection
from app.utils.helpers import to_object_id, serialize_document
from app.services.groq_service import extract_skills


def create_candidate(name: str, email: str, resume_text: str) -> dict:
    if not resume_text or not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is empty.")

    extracted_skills = extract_skills(resume_text)

    document = {
        "name": name,
        "email": email,
        "resume_text": resume_text,
        "extracted_skills": extracted_skills,
        "uploaded_at": datetime.utcnow(),
    }

    try:
        collection = get_collection("candidates")
        result = collection.insert_one(document)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while saving candidate: {exc}") from exc

    document["_id"] = result.inserted_id
    return serialize_document(document)


def get_candidate(candidate_id: str) -> dict:
    collection = get_collection("candidates")
    try:
        doc = collection.find_one({"_id": to_object_id(candidate_id)})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while fetching candidate: {exc}") from exc

    if not doc:
        raise HTTPException(status_code=404, detail=f"Candidate with id '{candidate_id}' not found.")
    return serialize_document(doc)


def list_candidates() -> list:
    collection = get_collection("candidates")
    try:
        docs = list(collection.find().sort("uploaded_at", -1))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while listing candidates: {exc}") from exc
    return [serialize_document(d) for d in docs]
