import React, { useState, useEffect } from 'react';
import { MoreVertical, Search, Filter } from 'lucide-react';
import './ApplyStatus.css';

// ─── inline mock data (replace with real API calls when ready) ───
const MOCK_APPLICATIONS = [
  { id: 1, company: 'Google',   title: 'Senior UX Engineer',    date: 'Apr 10, 2025', status: 'Interviewing' },
  { id: 2, company: 'Stripe',   title: 'Frontend Engineer',     date: 'Apr 8, 2025',  status: 'In Review'    },
  { id: 3, company: 'Airbnb',   title: 'UI Developer',          date: 'Apr 5, 2025',  status: 'Shortlisted'  },
  { id: 4, company: 'Meta',     title: 'React Engineer',        date: 'Apr 3, 2025',  status: 'Applied'      },
  { id: 5, company: 'Linear',   title: 'Product Engineer',      date: 'Mar 29, 2025', status: 'In Review'    },
  { id: 6, company: 'Vercel',   title: 'UI Engineer',           date: 'Mar 25, 2025', status: 'Interviewing' },
  { id: 7, company: 'Notion',   title: 'Software Engineer, Web',date: 'Mar 20, 2025', status: 'Applied'      },
  { id: 8, company: 'Figma',    title: 'Frontend Developer',    date: 'Mar 15, 2025', status: 'Closed'       },
];
// ─────────────────────────────────────────────────────────────────

const ApplyStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // Simulates async fetch — swap with real API call later
    setApplications(MOCK_APPLICATIONS);
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-full">
      <div className="spinner"></div>
    </div>
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Review':    return 'badge-review';
      case 'Interviewing': return 'badge-interview';
      case 'Shortlisted':  return 'badge-shortlist';
      case 'Applied':      return 'badge-applied';
      case 'Closed':       return 'badge-closed';
      default:             return 'badge-default';
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex justify-between items-start mb-6 align-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Application Tracker</h1>
          <p className="text-gray-500 text-sm">Real-time status of your automated job hunt.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline px-4 py-2">Export Report</button>
          <button className="btn-primary px-4 py-2 shadow-btn">+ New Track</button>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6 stat-row">
        <div className="card app-stat-card">
          <div className="flex justify-between items-center mb-2">
            <span className="app-stat-icon icon-blue">→</span>
            <span className="app-trend trend-green">+12%</span>
          </div>
          <p className="app-stat-label">Total Applied</p>
          <h3 className="app-stat-value">128</h3>
        </div>
        <div className="card app-stat-card">
          <div className="flex justify-between items-center mb-2">
            <span className="app-stat-icon icon-indigo">💬</span>
            <span className="app-trend trend-green">+5%</span>
          </div>
          <p className="app-stat-label">Interviews</p>
          <h3 className="app-stat-value">12</h3>
        </div>
        <div className="card app-stat-card">
          <div className="flex justify-between items-center mb-2">
            <span className="app-stat-icon icon-orange">•••</span>
            <span className="app-trend trend-red">-2%</span>
          </div>
          <p className="app-stat-label">Pending</p>
          <h3 className="app-stat-value">45</h3>
        </div>
        <div className="card app-stat-card">
          <div className="flex justify-between items-center mb-2">
            <span className="app-stat-icon icon-green">🏆</span>
            <span className="app-trend trend-green">+1%</span>
          </div>
          <p className="app-stat-label">Offers</p>
          <h3 className="app-stat-value">3</h3>
        </div>
      </div>

      {/* ── table ── */}
      <div className="card table-container">
        <div className="table-header flex justify-between items-center">
          <div className="search-wrapper">
            <Search className="search-icon text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by company or role..."
              className="search-input text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 tbl-actions">
            <select
              className="filter-select text-sm focus-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="In Review">In Review</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Applied">Applied</option>
              <option value="Closed">Closed</option>
            </select>
            <button className="btn-outline flex items-center gap-2 px-4 py-2 text-sm bg-white">
              <Filter size={16} /> More Filters
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="app-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Job Title</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="company-avatar">{app.company.charAt(0)}</div>
                      <span className="font-bold text-slate-800">{app.company}</span>
                    </div>
                  </td>
                  <td className="text-gray-500 font-medium">{app.title}</td>
                  <td className="text-gray-400">{app.date}</td>
                  <td>
                    <span className={`status-badge-tbl ${getStatusBadgeClass(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-btn">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No applications match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {filtered.length} of {applications.length} applications
          </span>
          <div className="flex gap-1 pagination">
            <button className="page-btn" disabled>&lt;</button>
            <button className="page-btn" disabled>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyStatus;