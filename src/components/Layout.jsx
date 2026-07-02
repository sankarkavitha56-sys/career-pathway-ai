import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GridBackground from './GridBackground';
import CustomCursor from './CustomCursor';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    const routeTitles = {
      '/dashboard':           'Dashboard',
      '/resume-generator':    'Generate Resume',
      '/resume-analyzer':     'Resume Analyzer',
      '/mock-interviews':     'Mock Interviews',
      '/mock-gd':             'Mock Group Discussion',
      '/mock-aptitude':       'Mock Aptitude Test',
      '/recommended-courses': 'Recommended Courses',
      '/apply-status':        'Application Tracker',
      '/job-search':          'Job Search',
      '/my-profile':          'My Profile',
    };
    setPageTitle(routeTitles[location.pathname] || 'Career Pathway');
  }, [location]);

  return (
    <div className="layout-container flex h-screen relative">
      <CustomCursor />
      <Sidebar />
      <div className="layout-main flex-1 flex flex-col relative z-10">
        <Header title={pageTitle} />
        <main className="layout-content flex-1 relative overflow-hidden" style={{ background: 'var(--bg-color)' }}>
          <GridBackground />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;