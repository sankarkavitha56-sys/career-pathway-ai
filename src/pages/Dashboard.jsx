import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Briefcase, FileText, Award } from 'lucide-react';
import './Dashboard.css';

// ─── inline mock data (replace with real API calls when ready) ───
const MOCK_SCORE = { score: 87 };
const MOCK_JOBS = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Stripe' },
  { id: 2, title: 'Product Engineer',         company: 'Linear' },
  { id: 3, title: 'UI Engineer',              company: 'Vercel' },
];
const MOCK_COURSES = [
  { id: 1, title: 'Advanced React Patterns' },
  { id: 2, title: 'TypeScript Deep Dive'    },
];
// ─────────────────────────────────────────────────────────────────

const chartData = [
  { name: 'Mon', score: 75 },
  { name: 'Tue', score: 78 },
  { name: 'Wed', score: 80 },
  { name: 'Thu', score: 82 },
  { name: 'Fri', score: 85 },
];

const Dashboard = () => {
  const [data, setData] = useState({ score: 0, jobs: [], courses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulates async fetch — swap these lines with real API calls later
    setData({
      score:   MOCK_SCORE.score,
      jobs:    MOCK_JOBS.slice(0, 3),
      courses: MOCK_COURSES.slice(0, 2),
    });
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-full">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl dashboard-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI-Powered Career System</h1>
          <p className="text-gray-500 text-sm">Manage your professional growth and automated job search.</p>
        </div>
        <button className="btn-outline flex items-center gap-2">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="dashboard-grid mb-6">
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Average ATS Score</p>
            <div className="stat-value-row">
              <h2 className="stat-value">{data.score}</h2>
              <span className="stat-trend trend-up">↑ 5%</span>
            </div>
            <div className="progress-bar-container mt-4">
              <div className="progress-bar-fill" style={{ width: `${data.score}%` }}></div>
            </div>
          </div>
          <div className="stat-icon icon-blue">
            <FileText size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Total Applications</p>
            <div className="stat-value-row">
              <h2 className="stat-value">124</h2>
              <span className="stat-trend trend-up">↑ 12%</span>
            </div>
            <p className="stat-subtext mt-4">Active applications: 15</p>
          </div>
          <div className="stat-icon icon-green">
            <Briefcase size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Courses Completed</p>
            <div className="stat-value-row">
              <h2 className="stat-value">12</h2>
              <span className="stat-trend trend-down">↓ 2%</span>
            </div>
            <p className="stat-subtext mt-4">4 pending recommendations</p>
          </div>
          <div className="stat-icon icon-orange">
            <Award size={20} />
          </div>
        </div>
      </div>

      <div className="card w-full mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-lg">System Overview</h3>
          <button className="text-primary font-semibold text-sm hover-link">View Detailed Analysis</button>
        </div>
        <div className="chart-container" style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card activity-card">
        <div className="activity-header">
          <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
          <button className="text-gray-400 text-sm hover-link">Clear All</button>
        </div>
        <div className="activity-list">
          {data.jobs.map((job, idx) => (
            <div key={job.id} className="activity-item">
              <div className="flex items-center gap-4 flex-1">
                <div className={`activity-icon icon-${idx === 0 ? 'blue' : idx === 1 ? 'orange' : 'primary'}`}>
                  {idx === 0 ? <FileText size={18} /> : idx === 1 ? <Briefcase size={18} /> : <Award size={18} />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">
                    {idx === 0
                      ? `Resume updated for "${job.title}" role`
                      : idx === 1
                      ? `Application sent to "${job.company}"`
                      : `New Course Recommendation: ${data.courses[0]?.title ?? 'Advanced React'}`}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {idx === 0 ? '2 hours ago' : idx === 1 ? '5 hours ago' : 'Yesterday'}
                  </p>
                </div>
              </div>
              <div className="activity-action shrink-0">
                {idx === 0 && <span className="status-badge badge-green">Score: 92</span>}
                {idx === 1 && <span className="status-badge badge-gray w-full justify-center">Pending</span>}
                {idx === 2 && <button className="btn-outline-primary text-xs w-full">Enroll</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;