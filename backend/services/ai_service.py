import random
import io
import os
import json

# Try to import real PDF library
try:
    from PyPDF2 import PdfReader
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# Try to import Google Gemini
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    else:
        GEMINI_AVAILABLE = False
except ImportError:
    GEMINI_AVAILABLE = False

# In-memory store for resumes { resume_id: str -> content: str }
RESUME_STORE: dict[str, str] = {}

def store_resume(resume_id: str, content: str):
    RESUME_STORE[resume_id] = content

def get_resume(resume_id: str) -> str | None:
    return RESUME_STORE.get(resume_id)

def extract_pdf_text(content: bytes) -> str:
    """Extract text from PDF bytes using PyPDF2."""
    if not PDF_AVAILABLE:
        return content.decode("utf-8", errors="ignore")
    try:
        reader = PdfReader(io.BytesIO(content))
        texts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                texts.append(t)
        return "\n".join(texts).strip()
    except Exception:
        return content.decode("utf-8", errors="ignore")

def _call_gemini(prompt: str) -> str | None:
    """Call Google Gemini and return the text response, or None on failure."""
    if not GEMINI_AVAILABLE:
        return None
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return None

# ─── Resume Analysis ───────────────────────────────────────────────────────────

def analyze_resume_with_ai(resume_text: str, role: str) -> dict:
    """Analyze resume text and return structured feedback."""
    if GEMINI_AVAILABLE and resume_text:
        prompt = f"""
You are a professional resume reviewer and ATS expert. Analyze the following resume for a {role} position.

Resume:
{resume_text[:4000]}

Return ONLY a valid JSON object with these keys (no markdown, no explanation):
{{
  "ats_score": <integer 0-100>,
  "strengths": [<list of 3-4 strength strings>],
  "weaknesses": [<list of 3-4 weakness strings>],
  "suggestions": [<list of 3-5 actionable suggestion strings>],
  "missing_keywords": [<list of 5-8 missing keyword strings for {role}>],
  "detected_skills": [<list of skills detected in the resume>]
}}
"""
        raw = _call_gemini(prompt)
        if raw:
            try:
                # Strip potential markdown code fences
                cleaned = raw.strip().strip("```json").strip("```").strip()
                return json.loads(cleaned)
            except Exception:
                pass

    # Fallback mock (realistic for recent grad)
    skills = _extract_mock_skills(resume_text)
    missing = [k for k in ["Docker", "Kubernetes", "AWS", "CI/CD", "TypeScript", "GraphQL", "Redis"] if k not in skills]
    score = 55 + random.randint(0, 30)
    return {
        "ats_score": score,
        "strengths": [
            "Clear education section with relevant coursework",
            "Good display of technical skills with specific technologies",
            "Project section demonstrates practical experience",
            "Well-organized and easy-to-read format"
        ],
        "weaknesses": [
            "Limited quantifiable achievements and metrics",
            "Missing action verbs in some bullet points",
            "No GitHub or portfolio link visible",
            "Professional summary is too generic"
        ],
        "suggestions": [
            "Add measurable outcomes to each bullet point (e.g., 'improved load time by 40%')",
            "Include links to GitHub, LinkedIn, and your portfolio",
            "Tailor the professional summary to the specific role you are applying for",
            "Use stronger action verbs like 'engineered', 'architected', 'spearheaded'",
            "Add relevant certifications if available"
        ],
        "missing_keywords": missing[:6],
        "detected_skills": skills
    }

# Keep old function name for backward compatibility
def analyze_resume(filename: str, role: str) -> dict:
    result = analyze_resume_with_ai("", role)
    return {
        "score": result["ats_score"],
        "detected_skills": result.get("detected_skills", []),
        "missing_skills": result.get("missing_keywords", []),
        "improvement_suggestions": [{"category": "General", "suggestion": s} for s in result.get("suggestions", [])],
        "keyword_optimization": result.get("missing_keywords", [])
    }

def _extract_mock_skills(text: str) -> list[str]:
    all_skills = ["Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
                  "SQL", "PostgreSQL", "MongoDB", "Git", "Docker", "AWS",
                  "FastAPI", "Flask", "Django", "HTML", "CSS", "Java", "C++", "Linux"]
    if not text:
        return random.sample(all_skills, 5)
    found = [s for s in all_skills if s.lower() in text.lower()]
    return found if found else random.sample(all_skills, 5)

# ─── Interview Questions ────────────────────────────────────────────────────────

def generate_questions_with_ai(resume_text: str, role: str) -> dict:
    """Generate categorized interview questions based on resume text."""
    if GEMINI_AVAILABLE and resume_text:
        prompt = f"""
You are an expert technical interviewer. Based on the resume below for a {role} position, generate interview questions.

Resume:
{resume_text[:3000]}

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "technical": [<list of 4 technical questions based on skills in resume>],
  "behavioral": [<list of 3 behavioral situational questions>],
  "project_based": [<list of 3 project-specific questions based on projects in resume>]
}}
"""
        raw = _call_gemini(prompt)
        if raw:
            try:
                cleaned = raw.strip().strip("```json").strip("```").strip()
                return json.loads(cleaned)
            except Exception:
                pass

    # Fallback mock questions
    skills = _extract_mock_skills(resume_text)
    skill1 = skills[0] if skills else "Python"
    skill2 = skills[1] if len(skills) > 1 else "React"
    return {
        "technical": [
            f"Explain the difference between synchronous and asynchronous programming in {skill1}.",
            f"How would you optimize a slow database query in a {role} project?",
            f"Describe the architecture of a recent project you built using {skill2}.",
            f"How do you handle state management in a large {skill2} application?",
        ],
        "behavioral": [
            "Tell me about a time you had to meet a tight deadline. How did you manage it?",
            "Describe a situation where you disagreed with a teammate. How did you resolve it?",
            "Give an example of a project where you had to learn a new technology quickly.",
        ],
        "project_based": [
            "Walk me through your most complex project end-to-end.",
            "What was the biggest technical challenge you faced in your projects and how did you solve it?",
            "How did you ensure code quality and testing in your projects?",
        ]
    }

# ─── Interview Session (kept for compatibility) ─────────────────────────────────

def generate_interview_question(role: str, previous_questions: list, resume_text: str | None = None) -> str:
    questions = [
        f"Tell me about a time you had to overcome a technical challenge as a {role}.",
        "How do you ensure the quality and maintainability of your code?",
        "Describe a complex project you worked on and your specific contributions.",
        "How do you handle disagreements with team members regarding technical decisions?"
    ]
    if resume_text:
        questions.extend([
            "I noticed your resume mentions React — how did you optimize component performance in your last project?",
            f"Can you explain your experience with the technologies listed in your resume for a {role} position?",
            "Walk me through a significant achievement from your resume and the impact it had.",
        ])
    available = [q for q in questions if q not in previous_questions]
    return random.choice(available) if available else "Do you have any questions for us?"

def evaluate_answer(question: str, answer: str) -> dict:
    score = min(100, 50 + len(answer) // 2) if answer else 30
    short = (answer[:30] + "...") if len(answer) > 30 else answer
    return {
        "score": score,
        "strengths": ["Clear articulation of the situation", "Demonstrated logical step-by-step thinking"],
        "improvements": [
            "Use the STAR method (Situation, Task, Action, Result) more explicitly",
            "Include specific technologies and measurable outcomes"
        ],
        "better_answer_example": f"Instead of saying '{short}', try: 'In my previous role, I faced [Situation]. I [Action], which resulted in [quantifiable Result].'"
    }

def generate_interview_summary(session_id: str) -> dict:
    return {
        "overall_score": random.randint(75, 92),
        "communication_score": random.randint(78, 95),
        "technical_score": random.randint(70, 90),
        "confidence_rating": random.choice(["High", "Medium-High"]),
        "personalized_tips": [
            "You showed great technical knowledge — focus more on explaining 'why' you made certain decisions.",
            "Practice the STAR method for behavioral questions to structure your answers better.",
            "Add more quantifiable impact statements to your answers."
        ]
    }
