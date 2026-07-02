import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';

import Dashboard from '../pages/Dashboard';
import ResumeGenerator from '../pages/ResumeGenerator';
import ResumeAnalyzer from '../pages/ResumeAnalyzer';
import MockInterviews from '../pages/MockInterviews';
import MockGD from '../pages/MockGD';
import MockAptitude from '../pages/MockAptitude';
import RecommendedCourses from '../pages/RecommendedCourses';
import ApplyStatus from '../pages/ApplyStatus';
import JobSearch from '../pages/JobSearch';
import MyProfile from '../pages/MyProfile';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* ── Core flow order per HireMate paper ── */}
        <Route path="dashboard"           element={<Dashboard />} />
        <Route path="resume-generator"    element={<ResumeGenerator />} />
        <Route path="resume-analyzer"     element={<ResumeAnalyzer />} />
        <Route path="mock-interviews"     element={<MockInterviews />} />
        <Route path="mock-gd"             element={<MockGD />} />
        <Route path="mock-aptitude"       element={<MockAptitude />} />
        <Route path="recommended-courses" element={<RecommendedCourses />} />

        {/* ── Other pages ── */}
        <Route path="apply-status"        element={<ApplyStatus />} />
        <Route path="job-search"          element={<JobSearch />} />
        <Route path="my-profile"          element={<MyProfile />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;