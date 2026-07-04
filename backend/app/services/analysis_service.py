from datetime import datetime
from fastapi import HTTPException
from app.database import get_collection
from app.utils.helpers import to_object_id, serialize_document, classify_match
from app.services.job_service import get_job
from app.services.candidate_service import get_candidate_by_user_id
from app.services.groq_service import analyze_skill_gap
from app.services.email_service import notify_high_match


def run_analysis(job_id: str, user_id: str) -> dict:
    job = get_job(job_id)
    candidate = get_candidate_by_user_id(user_id)

    job_skills = job.get("required_skills", [])
    candidate_skills = candidate.get("extracted_skills", [])

    if not job_skills:
        raise HTTPException(
            status_code=400,
            detail="This job has no extracted required skills. Ask HR to re-upload the job description.",
        )
    if not candidate_skills:
        raise HTTPException(
            status_code=400,
            detail="No resume skills found for your account. Please upload your resume first.",
        )

    ai_result = analyze_skill_gap(job_skills, candidate_skills)

    matched = ai_result.get("matched_skills") or []
    total_required = len(job_skills)
    match_score = round((len(matched) / total_required) * 100, 2) if total_required else 0.0
    match_score = min(match_score, 100.0)
    match_category = classify_match(match_score)

    document = {
        "job_id": to_object_id(job_id),
        "candidate_id": to_object_id(candidate["id"]),
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
    analysis = serialize_document(document)

    # Fire-and-forget notification; failures are logged, never raised.
    try:
        notify_high_match(job, candidate, analysis)
    except Exception as exc:
        print(f"[analysis_service] Notification step failed silently: {exc}")

    return analysis


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
