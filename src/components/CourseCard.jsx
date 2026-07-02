import React from 'react';
import { Star, TrendingUp, Users } from 'lucide-react';
import './CourseCard.css';

const CourseCard = ({ title, category, image, platform, rating, students, badge, url, trending }) => {
  return (
    <div className="course-card flex flex-col h-full">
      <div className="course-image-wrapper">
        <div className="course-bg" style={{ background: `url(${image}) center/cover no-repeat` }} />
        {badge && (
          <div className="course-badge">{badge}</div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="course-category">{category}</p>
        <h3 className="course-title mb-2 line-clamp-2">{title}</h3>
        <p className="course-desc flex-1 line-clamp-2">
          Gain in-demand skills with hands-on projects and industry-recognized curriculum.
        </p>

        <div className="course-meta">
          <div className="course-platform">
            <div className="platform-icon">{platform?.charAt(0) || 'P'}</div>
            {platform}
          </div>
          <div className="flex items-center gap-3">
            {trending && (
              <span className="course-tag-popular">
                <TrendingUp size={12} /> Popular
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-800">
              <Users size={12} color="#64748b" /> {students}
            </span>
          </div>
        </div>

        <div className="course-footer">
          <div className="course-rating">
            <Star size={16} className="fill-current" /> {rating}
          </div>
          <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-explore"
            style={{ textDecoration: 'none' }}
          >
            Explore Course <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;