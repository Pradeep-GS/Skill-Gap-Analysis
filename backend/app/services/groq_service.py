import json
import re
from groq import Groq, GroqError
from fastapi import HTTPException
from app.config import settings

_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY is not configured on the server.",
            )
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _extract_json_block(raw_text: str):
    """
    Groq sometimes wraps JSON in markdown code fences or adds extra text.
    This strips fences and extracts the first valid JSON array/object.
    """
    if not raw_text:
        raise ValueError("Empty response from AI model.")

    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: find the first { ... } or [ ... ] block
    match = re.search(r"(\{.*\}|\[.*\])", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Could not parse JSON from AI response: {exc}") from exc

    raise ValueError("AI response did not contain valid JSON.")


def _call_groq(prompt: str, system_prompt: str) -> str:
    client = get_client()
    try:
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=2048,
        )
    except GroqError as exc:
        raise HTTPException(
            status_code=502, detail=f"Groq API request failed: {exc}"
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Unexpected error calling Groq API: {exc}"
        ) from exc

    if not completion.choices:
        raise HTTPException(status_code=502, detail="Groq API returned no choices.")

    content = completion.choices[0].message.content
    if not content or not content.strip():
        raise HTTPException(status_code=502, detail="Groq API returned an empty response.")

    return content


def extract_skills(text: str) -> list:
    """Extract technical/professional skills from a block of text using Groq."""
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="No text provided for skill extraction.")

    system_prompt = (
        "You are a precise skill extraction engine. "
        "Extract only technical and professional skills from the given text. "
        "Return ONLY a valid JSON array of strings, with no explanation, "
        "no markdown formatting, and no extra text. Example: [\"React\", \"Node.js\", \"MongoDB\"]"
    )
    prompt = f"Extract skills from the following text:\n\n{text[:8000]}"

    raw = _call_groq(prompt, system_prompt)

    try:
        parsed = _extract_json_block(raw)
    except ValueError as exc:
        raise HTTPException(
            status_code=502, detail=f"Failed to parse skills from AI response: {exc}"
        ) from exc

    if not isinstance(parsed, list):
        raise HTTPException(
            status_code=502, detail="AI response for skill extraction was not a JSON array."
        )

    # Normalize: strings only, deduplicated, trimmed
    skills = sorted({str(s).strip() for s in parsed if str(s).strip()})
    return skills


def analyze_skill_gap(job_skills: list, candidate_skills: list) -> dict:
    """Use Groq to compare job vs candidate skills and produce a full gap analysis."""
    if not job_skills:
        raise HTTPException(status_code=400, detail="Job skills list is empty.")
    if not candidate_skills:
        raise HTTPException(status_code=400, detail="Candidate skills list is empty.")

    system_prompt = (
        "You are an AI Skill Gap Analysis Agent. "
        "You must return ONLY a valid JSON object with no explanation, "
        "no markdown formatting, and no extra text."
    )

    prompt = f"""
Job Skills: {json.dumps(job_skills)}
Candidate Skills: {json.dumps(candidate_skills)}

Tasks:
1. Find matched skills (present in both lists, accounting for close synonyms).
2. Find missing skills (required by job but not present in candidate skills).
3. Explain the candidate's strengths relative to the job.
4. Explain the candidate's weaknesses relative to the job.
5. Recommend concrete learning actions to close the gaps.
6. Provide a step-by-step learning roadmap (ordered list of steps).

Return exactly this JSON structure:
{{
  "matched_skills": [],
  "missing_skills": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "roadmap": []
}}
"""

    raw = _call_groq(prompt, system_prompt)

    try:
        parsed = _extract_json_block(raw)
    except ValueError as exc:
        raise HTTPException(
            status_code=502, detail=f"Failed to parse analysis from AI response: {exc}"
        ) from exc

    if not isinstance(parsed, dict):
        raise HTTPException(
            status_code=502, detail="AI response for analysis was not a JSON object."
        )

    required_keys = [
        "matched_skills",
        "missing_skills",
        "strengths",
        "weaknesses",
        "recommendations",
        "roadmap",
    ]
    result = {}
    for key in required_keys:
        value = parsed.get(key, [])
        result[key] = value if isinstance(value, list) else []

    return result
