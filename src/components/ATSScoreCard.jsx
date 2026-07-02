import React from 'react';
import './ATSScoreCard.css';

const ATSScoreCard = ({ score = 85, keywords = 92, formatting = 78 }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 score-card-container">
      <h3 className="score-title">ATS COMPATIBILITY</h3>
      
      <div className="score-circle-wrapper">
        <svg className="score-svg w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="score-track"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="score-fill"
            strokeLinecap="round"
          />
        </svg>
        <div className="score-text-overlay">
          <span className="score-number font-extrabold text-slate-800">{score}</span>
          <span className="score-max font-medium">/ 100</span>
        </div>
      </div>

      <div className="flex w-full gap-4 mt-8">
        <div className="metric-box box-green flex-1">
          <p className="metric-label">Keywords</p>
          <p className="metric-value font-bold text-slate-800">{keywords}%</p>
        </div>
        <div className="metric-box box-orange flex-1">
          <p className="metric-label">Formatting</p>
          <p className="metric-value font-bold text-slate-800">{formatting}%</p>
        </div>
      </div>
    </div>
  );
};

export default ATSScoreCard;
