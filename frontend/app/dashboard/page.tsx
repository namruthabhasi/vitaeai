"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Resume Score',
        data: [65, 68, 75, 78, 85, 92],
        backgroundColor: 'rgba(67, 97, 238, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Interview Performance',
        data: [50, 55, 65, 70, 80, 88],
        backgroundColor: 'rgba(56, 176, 0, 0.8)',
        borderRadius: 6,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: { y: { beginAtZero: true, max: 100 } }
  };

  return (
    <div className="dashboard-container">
      <h1 className="page-title">User Dashboard</h1>
      <p className="page-subtitle">Welcome back! Here is your recent activity and progress overview.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        <div className="card" style={{display: "flex", alignItems: "center", gap: "1.5rem"}}>
          <div style={{background: "rgba(67, 97, 238, 0.1)", color: "var(--primary)", padding: "1.25rem", borderRadius: "50%"}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h3 style={{fontSize: "2.5rem", fontWeight: "800", lineHeight: 1}}>3</h3>
            <p style={{color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontWeight: 500}}>Resumes Analyzed</p>
          </div>
        </div>
        
        <div className="card" style={{display: "flex", alignItems: "center", gap: "1.5rem"}}>
          <div style={{background: "rgba(56, 176, 0, 0.1)", color: "var(--success)", padding: "1.25rem", borderRadius: "50%"}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          </div>
          <div>
            <h3 style={{fontSize: "2.5rem", fontWeight: "800", lineHeight: 1}}>5</h3>
            <p style={{color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontWeight: 500}}>Interviews Completed</p>
          </div>
        </div>
        
        <div className="card" style={{display: "flex", alignItems: "center", gap: "1.5rem"}}>
          <div style={{background: "rgba(255, 183, 3, 0.1)", color: "var(--warning)", padding: "1.25rem", borderRadius: "50%"}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div>
            <h3 style={{fontSize: "2.5rem", fontWeight: "800", lineHeight: 1}}>92<span style={{fontSize:"1.25rem", color: "var(--text-muted)"}}>/100</span></h3>
            <p style={{color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontWeight: 500}}>Latest Resume Score</p>
          </div>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr", gap: "2rem"}}>
        <div className="card" style={{height: "450px", display: "flex", flexDirection: "column"}}>
          <h2 style={{fontSize: "1.5rem", marginBottom: "0.5rem"}}>Performance Analytics</h2>
          <p style={{color: "var(--text-muted)", marginBottom: "1.5rem"}}>Your scores are improving over time. Keep practicing!</p>
          <div style={{flex: 1, position: "relative"}}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
