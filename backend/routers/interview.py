from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services import ai_service
import uuid

router = APIRouter()

# ─── Models ──────────────────────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    role: str
    resume_id: Optional[str] = None

class InterviewStartResponse(BaseModel):
    session_id: str
    role: str
    first_question: str

class AnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str

class AnswerResponse(BaseModel):
    score: int
    strengths: List[str]
    improvements: List[str]
    better_answer_example: str
    next_question: str

class InterviewSummaryRequest(BaseModel):
    session_id: str

class InterviewSummaryResponse(BaseModel):
    overall_score: int
    communication_score: int
    technical_score: int
    confidence_rating: str
    personalized_tips: List[str]

class GenerateQuestionsRequest(BaseModel):
    resume_id: str
    role: str = "Software Developer"

class GenerateQuestionsResponse(BaseModel):
    technical: List[str]
    behavioral: List[str]
    project_based: List[str]

# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions(request: GenerateQuestionsRequest):
    """Generate categorized interview questions based on a resume."""
    resume_text = ai_service.get_resume(request.resume_id)
    if resume_text is None:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload first.")
    result = ai_service.generate_questions_with_ai(resume_text, request.role)
    return GenerateQuestionsResponse(
        technical=result.get("technical", []),
        behavioral=result.get("behavioral", []),
        project_based=result.get("project_based", [])
    )

@router.post("/start", response_model=InterviewStartResponse)
def start_interview(request: InterviewStartRequest):
    session_id = str(uuid.uuid4())
    resume_text = ai_service.get_resume(request.resume_id) if request.resume_id else None
    first_q = ai_service.generate_interview_question(request.role, [], resume_text)
    return InterviewStartResponse(
        session_id=session_id,
        role=request.role,
        first_question=first_q
    )

@router.post("/answer", response_model=AnswerResponse)
def submit_answer(request: AnswerRequest):
    evaluation = ai_service.evaluate_answer(request.question, request.answer)
    next_q = ai_service.generate_interview_question("Software Developer", [request.question])
    return AnswerResponse(
        score=evaluation["score"],
        strengths=evaluation["strengths"],
        improvements=evaluation["improvements"],
        better_answer_example=evaluation["better_answer_example"],
        next_question=next_q
    )

@router.post("/summary", response_model=InterviewSummaryResponse)
def get_interview_summary(request: InterviewSummaryRequest):
    return ai_service.generate_interview_summary(request.session_id)
