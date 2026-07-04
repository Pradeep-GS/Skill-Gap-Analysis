from datetime import datetime
from fastapi import HTTPException
from app.database import get_collection
from app.utils.helpers import to_object_id, serialize_document, classify_match
from app.services.job_service import get_job
from app.services.candidate_service import get_candidate
from app.services.groq_service import analyze_skill_gap


def run_analysis(job_id: str, candidate_id: str) -> dict:
    job = get_job(job_id)
    candidate = get_candidate(candidate_id)

    job_skills = job.get("required_skills", [])
    candidate_skills = candidate.get("extracted_skills", [])

    if not job_skills:
        raise HTTPException(
            status_code=400,
            detail="This job has no extracted required skills. Re-upload the job description.",
        )
    if not candidate_skills:
        raise HTTPException(
            status_code=400,
            detail="This candidate has no extracted skills. Re-upload the resume.",
        )

    ai_result = analyze_skill_gap(job_skills, candidate_skills)

    matched = ai_result.get("matched_skills") or []
    total_required = len(job_skills)
    match_score = round((len(matched) / total_required) * 100, 2) if total_required else 0.0
    match_score = min(match_score, 100.0)
    match_category = classify_match(match_score)

    document = {
        "job_id": to_object_id(job_id),
        "candidate_id": to_object_id(candidate_id),
        "matched_skills": matched,
        "missing_skills": ai_result.get("missing_skills") or [],
        "strengths": ai_result.get("strengths") or [],
        "weaknesses": ai_result.get("weaknesses") or [],
        "recommendations": ai_result.get("recommendations") or [],
        "roadmap": ai_result.get("roadmap") or [],
        "match_score": match_score,
        "match_category": match_category,
        "created_at": datetime.utcnow(),
    }

    try:
        collection = get_collection("analyses")
        result = collection.insert_one(document)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while saving analysis: {exc}") from exc

    document["_id"] = result.inserted_id
    return serialize_document(document)


def get_analysis(analysis_id: str) -> dict:
    collection = get_collection("analyses")
    try:
        doc = collection.find_one({"_id": to_object_id(analysis_id)})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while fetching analysis: {exc}") from exc

    if not doc:
        raise HTTPException(status_code=404, detail=f"Analysis with id '{analysis_id}' not found.")
    return serialize_document(doc)
