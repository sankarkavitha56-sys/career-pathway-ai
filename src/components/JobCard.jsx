import React from 'react';
import './JobCard.css';

const JobCard = ({ title, company, location, salary, tags, matchScore, status, id }) => {
  return (
    <div className="card job-card-container">
      <div className="flex justify-between items-start mb-4 job-card-header">
        <div className="flex gap-4">
          <div className="job-company-logo">
            {company.charAt(0)}
          </div>
          <div>
            <h3 className="job-title text-slate-800">{title}</h3>
            <p className="job-meta mt-1">
              {company} • {location}
            </p>
          </div>
        </div>
        <div className="job-match-section" style={{ textAlign: 'right' }}>
          <div className={`match-badge ${matchScore >= 90 ? 'match-high' : matchScore >= 80 ? 'match-med' : 'match-low'}`}>
            {matchScore}% Match
          </div>
          <p className="job-salary mt-2">{salary}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 job-card-footer">
        <div className="flex flex-wrap gap-2 tag-list">
          {tags.map((tag) => (
            <span key={tag} className="job-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 action-list">
          {status === 'auto-applied' && (
            <span className="auto-apply-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              AUTO-APPLIED
            </span>
          )}
          {status === 'reviewing' && (
            <span className="reviewing-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              REVIEWING
            </span>
          )}
          <button className={`job-action-btn ${status === 'not-applied' ? 'btn-primary' : 'btn-outline'}`}>
            {status === 'not-applied' ? 'Apply Now' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
