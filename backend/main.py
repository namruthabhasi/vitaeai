from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, interview
app = FastAPI(title="VitaeAI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with exact frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
