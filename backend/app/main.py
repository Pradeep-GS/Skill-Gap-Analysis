from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import job_routes, candidate_routes, analysis_routes

app = FastAPI(
    title="Skill Gap Analysis Agent API",
    description="AI-powered API for comparing job descriptions against candidate resumes "
                 "to identify skill gaps and generate learning roadmaps.",
    version="1.0.0",
)

# CORS configuration
allowed_origins = [settings.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.get("/")
async def root():
    return {
        "message": "Skill Gap Analysis Agent API is running.",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


app.include_router(job_routes.router, prefix="/api")
app.include_router(candidate_routes.router, prefix="/api")
app.include_router(analysis_routes.router, prefix="/api")
