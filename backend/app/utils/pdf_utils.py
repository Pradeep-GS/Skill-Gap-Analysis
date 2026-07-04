import io
import pdfplumber
from fastapi import HTTPException, UploadFile


ALLOWED_CONTENT_TYPES = {"application/pdf"}
MAX_FILE_SIZE_MB = 10


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Reads an uploaded PDF file and extracts plain text from all pages.
    Raises HTTPException on invalid file, empty content, or parse failure.
    """
    if file is None:
        raise HTTPException(status_code=400, detail="No file was uploaded.")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Only PDF files are supported.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.2f} MB). Maximum allowed size is {MAX_FILE_SIZE_MB} MB.",
        )

    try:
        text_parts = []
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            if len(pdf.pages) == 0:
                raise HTTPException(status_code=400, detail="PDF has no pages.")
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400, detail=f"Failed to parse PDF file: {exc}"
        ) from exc

    full_text = "\n".join(text_parts).strip()

    if not full_text:
        raise HTTPException(
            status_code=400,
            detail="Could not extract any readable text from the PDF. "
            "The file may be scanned/image-based.",
        )

    return full_text
