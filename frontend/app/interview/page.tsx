"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface InterviewSession {
  session_id: string;
  role: string;
  first_question?: string;
}

interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  better_answer_example: string;
  next_question?: string;
}

interface InterviewSummary {
  overall_score: number;
  communication_score: number;
  technical_score: number;
  confidence_rating: string;
  personalized_tips: string[];
}

export default function InterviewSimulator() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'Software Developer';
  const resumeId = searchParams.get('resume_id');

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const [questionCount, setQuestionCount] = useState(0);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, resume_id: resumeId || undefined })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setCurrentQuestion(data.first_question);
      } else {
        throw new Error();
      }
    } catch {
      // Mock start
      setTimeout(() => {
        setSession({ session_id: "123", role });
        setCurrentQuestion(`Tell me about a challenging project you worked on as a ${role}.`);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !session) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.session_id, question: currentQuestion, answer })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        setCurrentQuestion(data.next_question);
        setAnswer("");
        setQuestionCount(prev => prev + 1);
      } else {
        throw new Error();
      }
    } catch {
      // Mock answer eval
      setTimeout(() => {
        setFeedback({
          score: Math.min(100, 50 + Math.floor(answer.length / 2)),
          strengths: ["Provided good starting context", "Clear communication style"],
          improvements: ["Use the STAR method more clearly", "Add specific technical details (languages, frameworks)"],
          better_answer_example: "A stronger answer would start with the specific situation, followed by the measurable impact of your contribution..."
        });
        setCurrentQuestion("How do you handle disagreements within a team setting involving a critical technical decision?");
        setAnswer("");
        setQuestionCount(prev => prev + 1);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/interview/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.session_id })
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        throw new Error();
      }
    } catch {
      setTimeout(() => {
        setSummary({
          overall_score: 85,
          communication_score: 88,
          technical_score: 82,
          confidence_rating: "High",
          personalized_tips: [
            "You presented your technical skills well.",
            "Work on providing more concise answers using the STAR method.",
            "Maintain your high level of professional confidence."
          ]
        });
        setLoading(false);
      }, 1000);
    }
  };

  if (summary) {
    return (
      <div className="interview-container">
        <h1 className="page-title text-center" style={{ marginBottom: "3rem" }}>Interview Summary Dashboard</h1>
        <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "3.5rem", fontWeight: 800, color: "var(--primary)", margin: 0, lineHeight: 1 }}>{summary.overall_score}<span style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>/100</span></h2>
              <p style={{ color: "var(--text-muted)", margin: 0, marginTop: "0.5rem", fontSize: "1.1rem", fontWeight: 500 }}>Overall Performance</p>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>Communication: <span style={{ color: "var(--success)" }}>{summary.communication_score}</span></p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>Technical Analysis: <span style={{ color: "var(--primary)" }}>{summary.technical_score}</span></p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>Confidence Rating: <span style={{ color: "var(--warning)" }}>{summary.confidence_rating}</span></p>
            </div>
          </div>

          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Personalized Improvement Tips</h3>
          <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {summary.personalized_tips.map((tip: string, i: number) => (
              <li key={i} style={{ padding: "1.5rem", background: "var(--secondary)", borderRadius: "8px", display: "flex", gap: "1rem", alignItems: "flex-start", border: "1px solid var(--border-light)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span style={{ color: "var(--text-main)", lineHeight: 1.6 }}>{tip}</span>
              </li>
            ))}
          </ul>

          <button className="btn-primary" style={{ marginTop: "3rem", width: "100%", padding: "1rem", fontSize: "1.1rem" }} onClick={() => { setSummary(null); setSession(null); setQuestionCount(0); setFeedback(null); }}>
            Start Another Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 className="page-title">AI Interview Simulator</h1>
      <p className="page-subtitle">Practice interactive interview questions specifically tailored to your role, getting real-time constructive feedback.</p>

      {!session ? (
        <div className="card text-center" style={{ maxWidth: "500px", margin: "4rem auto", padding: "4rem 3rem" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1.5rem" }}><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          <div style={{ marginBottom: "2.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 600, fontSize: "1.1rem" }}>Select Target Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "1.05rem", textAlign: "center", background: "var(--secondary)" }}
            />
          </div>
          <button className="btn-primary" onClick={startInterview} disabled={loading} style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}>
            {loading ? "Preparing Simulator..." : "Start Interview Practice"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", padding: "1.25rem 2rem", borderRadius: "12px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>Target Role: <span style={{ color: "var(--primary)" }}>{role}</span></span>
            <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>Questions Completed: <span style={{ color: "var(--success)" }}>{questionCount}</span></span>
            <button className="btn-secondary" onClick={endInterview} disabled={loading} style={{ padding: "0.5rem 1.25rem" }}>Finish & See Summary</button>
          </div>

          <div className="card" style={{ padding: "3rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "2rem", color: "var(--text-main)", display: "flex", alignItems: "flex-start", gap: "1rem", lineHeight: 1.5 }}>
              <span style={{ color: "var(--primary)", fontWeight: 800 }}>Q:</span> {currentQuestion}
            </h3>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... (Try to use the STAR method)"
              style={{
                width: "100%", minHeight: "180px", padding: "1.5rem", borderRadius: "12px",
                border: "1px solid var(--border-light)", fontSize: "1.05rem", fontFamily: "inherit",
                resize: "vertical", marginBottom: "2rem", background: "var(--secondary)", color: "var(--text-main)"
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-primary" onClick={submitAnswer} disabled={loading || !answer.trim()} style={{ padding: "1rem 2rem", fontSize: "1.05rem" }}>
                {loading ? "Evaluating Answer..." : "Submit Answer"}
              </button>
            </div>
          </div>

          {feedback && !loading && (
            <div className="card" style={{ borderLeft: "6px solid var(--success)", padding: "2.5rem" }}>
              <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.5rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                AI Evaluation
                <span style={{ marginLeft: "auto", fontSize: "1.25rem", color: "var(--success)" }}>Score: {feedback.score}/100</span>
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
                <div>
                  <h4 style={{ color: "var(--success)", marginBottom: "1rem", fontSize: "1.1rem" }}>Strengths</h4>
                  <ul style={{ paddingLeft: "1.2rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.5rem", lineHeight: 1.6 }}>
                    {feedback.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: "var(--warning)", marginBottom: "1rem", fontSize: "1.1rem" }}>Areas to Improve</h4>
                  <ul style={{ paddingLeft: "1.2rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.5rem", lineHeight: 1.6 }}>
                    {feedback.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>

              <div style={{ background: "rgba(67, 97, 238, 0.05)", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(67, 97, 238, 0.2)" }}>
                <h4 style={{ color: "var(--primary)", marginBottom: "0.5rem", fontSize: "1.05rem" }}>Example Better Answer</h4>
                <p style={{ margin: 0, fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.6 }}>&quot;{feedback.better_answer_example}&quot;</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
