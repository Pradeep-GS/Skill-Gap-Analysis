from bson import ObjectId
from fastapi import HTTPException


def to_object_id(id_str: str) -> ObjectId:
    """Safely converts a string to a MongoDB ObjectId, raising a clean 400 error otherwise."""
    try:
        return ObjectId(id_str)
    except Exception as exc:
        raise HTTPException(
            status_code=400, detail=f"Invalid ID format: '{id_str}'"
        ) from exc


def serialize_document(doc: dict) -> dict:
    """Converts MongoDB document (with ObjectId) into a JSON-serializable dict."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    for key in ("job_id", "candidate_id"):
        if key in doc and isinstance(doc[key], ObjectId):
            doc[key] = str(doc[key])
    return doc


def classify_match(score: float) -> str:
    if score >= 80:
        return "Strong Match"
    elif score >= 60:
        return "Moderate Match"
    return "High Skill Gap"
