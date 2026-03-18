from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services import ai_service
import uuid

router = APIRouter()

# ─── Models ──────────────────────────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    resume_id: str
    filename: str
    characters_extracted: int
    message: str

class ResumeAnalysisResponse(BaseModel):
    resume_id: str
    ats_score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    missing_keywords: List[str]
    detected_skills: List[str]

class AnalyzeRequest(BaseModel):
    resume_id: str
    role: str = "Software Developer"
    job_description: Optional[str] = None

# Keep old response model for backward compat
class LegacyResumeAnalysisResponse(BaseModel):
    resume_id: str
    score: int
    detected_skills: List[str]
    missing_skills: List[str]
    improvement_suggestions: List[Dict[str, str]]
    keyword_optimization: List[str]

# ─── New Endpoints ────────────────────────────────────────────────────────────

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume_new(
    role: str = Form("Software Developer"),
    file: UploadFile = File(...)
):
    """Upload a PDF resume, extract its text, and store for analysis."""
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()

    # Validate file size (max 5 MB)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File is too large. Maximum size is 5 MB.")

    # Extract text
    text = ai_service.extract_pdf_text(content)

    # Generate unique ID and store
    resume_id = str(uuid.uuid4())
    ai_service.store_resume(resume_id, text or content.decode("utf-8", errors="ignore"))

    return ResumeUploadResponse(
        resume_id=resume_id,
        filename=file.filename,
        characters_extracted=len(text),
        message="Resume uploaded and processed successfully."
    )

@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume_new(request: AnalyzeRequest):
    """Analyze a previously uploaded resume and return detailed feedback."""
    resume_text = ai_service.get_resume(request.resume_id)
    if resume_text is None:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload again.")

    result = ai_service.analyze_resume_with_ai(resume_text, request.role)

    return ResumeAnalysisResponse(
        resume_id=request.resume_id,
        ats_score=result.get("ats_score", 65),
        strengths=result.get("strengths", []),
        weaknesses=result.get("weaknesses", []),
        suggestions=result.get("suggestions", []),
        missing_keywords=result.get("missing_keywords", []),
        detected_skills=result.get("detected_skills", [])
    )

# ─── Legacy Endpoint (kept for backward compat) ───────────────────────────────

@router.post("/upload", response_model=LegacyResumeAnalysisResponse)
async def upload_resume_legacy(role: str = Form(...), file: UploadFile = File(...)):
    content = await file.read()
    text = ai_service.extract_pdf_text(content)
    resume_id = str(uuid.uuid4())
    ai_service.store_resume(resume_id, text or content.decode("utf-8", errors="ignore"))
    result = ai_service.analyze_resume_with_ai(text, role)
    return LegacyResumeAnalysisResponse(
        resume_id=resume_id,
        score=result.get("ats_score", 65),
        detected_skills=result.get("detected_skills", []),
        missing_skills=result.get("missing_keywords", []),
        improvement_suggestions=[{"category": "Suggestion", "suggestion": s} for s in result.get("suggestions", [])],
        keyword_optimization=result.get("missing_keywords", [])
    )
