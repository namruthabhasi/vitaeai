import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Hero ── */}
      <section className="hero-section animate-fadeUp">
        <div className="hero-gradient" />

        {/* Badge */}
        <div className="chip chip-info animate-fadeUp mb-3" style={{ fontSize: '0.78rem' }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Powered by Google Gemini AI
        </div>

        <h1 className="hero-title animate-fadeUp delay-100">
          Improve Your Resume<br />
          <span className="gradient-text">with Artificial Intelligence</span>
        </h1>

        <p className="hero-subtitle animate-fadeUp delay-200">
          Upload your resume and get an instant ATS score, detailed feedback, missing keyword analysis, and personalized AI-generated interview questions — all in seconds.
        </p>

        <div className="hero-cta animate-fadeUp delay-300">
          <Link href="/resume" className="btn btn-primary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Analyze My Resume
          </Link>
          <Link href="/interview" className="btn btn-outline btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            Practice Interview
          </Link>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="grid grid-3 mb-4 animate-fadeUp delay-300" style={{ gap: '1rem' }}>
        {[
          { value: '95%', label: 'ATS Pass Rate', color: 'var(--success)' },
          { value: '3000+', label: 'Resumes Analyzed', color: 'var(--primary)' },
          { value: '10s', label: 'Average Analysis Time', color: 'var(--warning)' },
        ].map((s) => (
          <div key={s.label} className="card text-center" style={{ padding: '1.25rem' }}>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <div className="features-grid mb-4">
        {[
          {
            icon: (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            ),
            bg: 'var(--primary-light)', color: 'var(--primary)',
            title: 'ATS Score Analysis',
            desc: 'Get an instant Applicant Tracking System compatibility score and understand how recruiters see your resume.'
          },
          {
            icon: (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ),
            bg: 'var(--success-light)', color: 'var(--success)',
            title: 'Strengths & Weaknesses',
            desc: 'Get clear, actionable feedback on what\'s working in your resume and what needs to be improved.'
          },
          {
            icon: (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            ),
            bg: 'var(--warning-light)', color: 'var(--warning)',
            title: 'Interview Questions',
            desc: 'Generate role-specific technical, behavioral, and project-based interview questions from your resume.'
          },
          {
            icon: (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            ),
            bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
            title: 'Missing Keywords',
            desc: 'See which industry keywords and skills are missing from your resume that could be blocking your applications.'
          },
        ].map((f) => (
          <div key={f.title} className="card card-hover animate-fadeUp">
            <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
              {f.icon}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>{f.title}</h3>
            <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div className="card mb-4" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>How It Works</h2>
        <p className="text-muted text-sm mb-3">Three simple steps to a better resume.</p>
        <div className="grid grid-3" style={{ gap: '2rem' }}>
          {[
            { step: '01', title: 'Upload Your Resume', desc: 'Drag and drop your PDF resume. We support files up to 5MB.' },
            { step: '02', title: 'AI Analyzes It', desc: 'Our AI reads the resume, extracts skills, and scores it against ATS criteria.' },
            { step: '03', title: 'Get Your Report', desc: 'View your ATS score, feedback, and interview questions tailored to your profile.' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', opacity: 0.3, lineHeight: 1 }}>{item.step}</div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</h4>
              <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #06b6d4 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Ready to land your dream job?</h2>
        <p style={{ opacity: 0.85, marginBottom: '1.75rem', fontSize: '1rem' }}>Start with a free resume analysis. No sign-up required.</p>
        <Link href="/resume" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, padding: '0.9rem 2rem' }}>
          Get Started Free →
        </Link>
      </div>

    </div>
  );
}
