from datetime import datetime
from fastapi import HTTPException
from app.database import get_collection
from app.utils.helpers import serialize_document
from app.utils.security import hash_password, verify_password, create_access_token

VALID_ROLES = {"hr", "candidate"}


def register_user(name: str, email: str, password: str, role: str) -> dict:
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400, detail=f"Role must be one of: {', '.join(VALID_ROLES)}."
        )

    collection = get_collection("users")

    try:
        existing = collection.find_one({"email": email.lower()})
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error: {exc}") from exc

    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    document = {
        "name": name.strip(),
        "email": email.lower().strip(),
        "password_hash": hash_password(password),
        "role": role,
        "created_at": datetime.utcnow(),
    }

    try:
        result = collection.insert_one(document)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error while creating account: {exc}") from exc

    document["_id"] = result.inserted_id
    user = serialize_document(document)
    user.pop("password_hash", None)
    return user


def authenticate_user(email: str, password: str) -> dict:
    collection = get_collection("users")

    try:
        doc = collection.find_one({"email": email.lower().strip()})
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database error: {exc}") from exc

    if not doc or not verify_password(password, doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user = serialize_document(doc)
    user.pop("password_hash", None)
    return user


def build_token_response(user: dict) -> dict:
    token = create_access_token(
        {
            "sub": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }
    )
    return {"access_token": token, "token_type": "bearer", "user": user}
