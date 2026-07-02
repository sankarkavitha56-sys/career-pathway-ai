import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CourseCard from '../components/CourseCard';
import './RecommendedCourses.css';

const TABS = ['Recommended for You', 'Technical Skills', 'Soft Skills', 'Certifications'];

const RecommendedCourses = () => {
  const [allCourses, setAllCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended for You');

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await api.getRecommendedCourses();
      setAllCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const courses = allCourses[activeTab] || [];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl dashboard-container rc-container flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Skill Recommendations</h1>
          <p className="text-gray-500 text-sm">Curated courses to close your skill gaps and boost ATS score.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline px-4 py-2 text-slate-800" onClick={() => { setLoading(true); api.getRecommendedCourses().then(d => { setAllCourses(d); setLoading(false); }); }}>
            Refresh Match
          </button>
          <button className="btn-primary px-4 py-2 shadow-btn">
            View Roadmap
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rc-tabs-container mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rc-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        {courses.map(course => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="rc-stat-box box-primary">
          <h3 className="rc-stat-num text-primary">85%</h3>
          <p className="rc-stat-label">Profile Match</p>
        </div>
        <div className="rc-stat-box box-blue">
          <h3 className="rc-stat-num text-slate-800">4.2k</h3>
          <p className="rc-stat-label">Jobs Matching Skills</p>
        </div>
        <div className="rc-stat-box box-gray">
          <h3 className="rc-stat-num text-slate-800">12h</h3>
          <p className="rc-stat-label">Est. Study Time</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendedCourses;