from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.config import settings
from app.routes import job_routes, candidate_routes, analysis_routes, auth_routes

app = FastAPI(
    title="Skill Gap Analysis Agent API",
    description="AI-powered API for comparing job descriptions against candidate resumes "
                 "to identify skill gaps and generate learning roadmaps.",
    version="1.0.0",
)

ALLOWED_ORIGIN = "https://skill-gap-analysis-gs.vercel.app"
class ForceCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")

        # Handle preflight OPTIONS immediately — no need to hit the app
        if request.method == "OPTIONS":
            response = JSONResponse(content={}, status_code=200)
        else:
            try:
                response = await call_next(request)
            except Exception as exc:
                response = JSONResponse(
                    status_code=500,
                    content={"detail": f"Internal server error: {str(exc)}"},
                )

        # Always add CORS headers if origin is a Vercel app or localhost
        if origin.endswith(".vercel.app") or origin.startswith("http://localhost"):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Expose-Headers"] = "*"

        return response

app.add_middleware(ForceCORSMiddleware)

# ── Standard CORSMiddleware (handles non-error CORS details) ─────────────────
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://skill-gap-analysis-gs.vercel.app",
]
_env_frontend = settings.FRONTEND_URL.rstrip("/")
if _env_frontend and _env_frontend not in allowed_origins:
    allowed_origins.append(_env_frontend)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
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


app.include_router(auth_routes.router, prefix="/api")
app.include_router(job_routes.router, prefix="/api")
app.include_router(candidate_routes.router, prefix="/api")
app.include_router(analysis_routes.router, prefix="/api")
