"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Analysis {
  resume_id: string;
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missing_keywords: string[];
  detected_skills: string[];
  role: string;
  questions?: {
    technical: string[];
    behavioral: string[];
    project_based: string[];
  };
}

const scoreColor = (score: number) =>
  score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';

const scoreLabel = (score: number) =>
  score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';

// SVG circular gauge
function ScoreGauge({ score }: { score: number }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div className="score-gauge-wrapper" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" strokeWidth="14" stroke="var(--bg-secondary)" />
        <circle
          cx="90" cy="90" r={r} fill="none" strokeWidth="14"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="score-gauge-value">
        <span style={{ fontSize: '2.5rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
      </div>
    </div>
  );
}

function QuestionList({ questions }: { questions: string[] }) {
  return (
    <div>
      {questions.map((q, i) => (
        <div key={i} className="question-card">
          <div className="question-number">{i + 1}</div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{q}</p>
        </div>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const [data, setData] = useState<Analysis | null>(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const raw = sessionStorage.getItem('resumeAnalysis');
    if (raw) {
      try { setData(JSON.parse(raw)); } catch {}
    }
  }, []);

  if (!data) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }} className="animate-fadeUp">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>No Results Yet</h2>
        <p className="text-muted text-sm mb-3">
          You haven't analyzed a resume yet. Upload your PDF to get your ATS score, feedback, and interview questions.
        </p>
        <Link href="/resume" className="btn btn-primary">
          Analyze My Resume
        </Link>
      </div>
    );
  }

  const q = data.questions;
  const totalQuestions = (q?.technical?.length || 0) + (q?.behavioral?.length || 0) + (q?.project_based?.length || 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'keywords', label: 'Keywords & Skills' },
    ...(q ? [{ id: 'questions', label: `Interview Questions (${totalQuestions})` }] : []),
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-4 animate-fadeUp" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Analysis Results</h1>
          <p className="page-subtitle">Role: <strong>{data.role}</strong></p>
        </div>
        <div className="flex gap-1">
          <Link href="/resume" className="btn btn-outline">
            ↑ Upload New
          </Link>
          {q && (
            <Link href={`/interview?resume_id=${data.resume_id}&role=${encodeURIComponent(data.role)}`} className="btn btn-primary">
              Practice Interview →
            </Link>
          )}
        </div>
      </div>

      {/* Score Hero */}
      <div className="card mb-3 animate-fadeUp delay-100" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <ScoreGauge score={data.ats_score} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="flex items-center gap-1 mb-2">
              <span style={{ fontSize: '1.75rem', fontWeight: 900 }}>ATS Score</span>
              <span className={`chip ${data.ats_score >= 80 ? 'chip-success' : data.ats_score >= 60 ? 'chip-warning' : 'chip-danger'}`}>
                {scoreLabel(data.ats_score)}
              </span>
            </div>
            <p className="text-muted text-sm mb-3" style={{ lineHeight: 1.7 }}>
              Your resume scores <strong style={{ color: scoreColor(data.ats_score) }}>{data.ats_score}/100</strong> against Applicant Tracking System criteria for a <strong>{data.role}</strong> position.
              {data.ats_score < 80 && " Implementing the suggestions below can significantly improve your score."}
            </p>
            <div className="progress-track" style={{ marginBottom: '0.5rem' }}>
              <div className="progress-fill" style={{ width: `${data.ats_score}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted">0</span>
              <span className="text-xs" style={{ color: scoreColor(data.ats_score), fontWeight: 600 }}>{data.ats_score}</span>
              <span className="text-xs text-muted">100</span>
            </div>
          </div>
          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', minWidth: 200 }}>
            {[
              { label: 'Skills Found', value: data.detected_skills.length, color: 'var(--success)' },
              { label: 'Missing Keywords', value: data.missing_keywords.length, color: 'var(--danger)' },
              { label: 'Strengths', value: data.strengths.length, color: 'var(--primary)' },
              { label: 'Suggestions', value: data.suggestions.length, color: 'var(--warning)' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list animate-fadeUp delay-200">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid grid-2 animate-fadeUp">
          {/* Strengths */}
          <div className="card">
            <h3 className="flex items-center gap-1 mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>
              <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span> Strengths
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.strengths.map((s, i) => (
                <div key={i} style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--success-light)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--success-light)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--text-main)'
                }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          {/* Weaknesses */}
          <div className="card">
            <h3 className="flex items-center gap-1 mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>
              <span style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>✗</span> Areas to Improve
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.weaknesses.map((w, i) => (
                <div key={i} style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--danger-light)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--danger-light)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--text-main)'
                }}>
                  {w}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Feedback */}
      {tab === 'feedback' && (
        <div className="card animate-fadeUp">
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            💡 Actionable Suggestions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data.suggestions.map((s, i) => (
              <div key={i} style={{
                padding: '1rem 1.25rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderLeft: '4px solid var(--primary)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                gap: '0.875rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  minWidth: 24, height: 24,
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700
                }}>{i + 1}</div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Keywords & Skills */}
      {tab === 'keywords' && (
        <div className="grid grid-2 animate-fadeUp">
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
              ✅ Detected Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.detected_skills.map((s) => (
                <span key={s} className="chip chip-success">{s}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
              ⚠️ Missing Keywords
            </h3>
            <p className="text-muted text-xs mb-2" style={{ lineHeight: 1.6 }}>
              Adding these to your resume can improve your ATS score for <strong>{data.role}</strong> roles.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.missing_keywords.map((k) => (
                <span key={k} className="chip chip-danger">{k}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Interview Questions */}
      {tab === 'questions' && q && (
        <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            { key: 'technical', label: '⚙️ Technical', color: 'var(--primary)', badge: 'chip-info' },
            { key: 'behavioral', label: '💬 Behavioral', color: 'var(--warning)', badge: 'chip-warning' },
            { key: 'project_based', label: '🚀 Project-Based', color: 'var(--success)', badge: 'chip-success' },
          ].map(({ key, label, badge }) => {
            const qs = q[key as keyof typeof q] || [];
            if (!qs.length) return null;
            return (
              <div key={key} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{label}</h3>
                  <span className={`chip ${badge}`}>{qs.length} questions</span>
                </div>
                <QuestionList questions={qs} />
              </div>
            );
          })}

          <div className="alert alert-info">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Ready to practice? Click <strong>Practice Interview →</strong> above to start a live AI interview simulation using your resume.
          </div>
        </div>
      )}

    </div>
  );
}
