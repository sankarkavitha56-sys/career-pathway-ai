import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, Send,
  Search, User, Rocket, Mic, Users, Brain
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard',           path: '/dashboard',           icon: LayoutDashboard },
    { name: 'Generate Resume',     path: '/resume-generator',    icon: Rocket },
    { name: 'Resume Analyzer',     path: '/resume-analyzer',     icon: FileText },
    { name: 'Mock Interviews',     path: '/mock-interviews',     icon: Mic },
    { name: 'Mock GD',             path: '/mock-gd',             icon: Users },
    { name: 'Mock Aptitude',       path: '/mock-aptitude',       icon: Brain },
    { name: 'Recommended Courses', path: '/recommended-courses', icon: BookOpen },
    { name: 'Apply Status',        path: '/apply-status',        icon: Send },
    { name: 'Job Search',          path: '/job-search',          icon: Search },
    { name: 'My Profile',          path: '/my-profile',          icon: User },
  ];

  return (
    <aside className="sidebar flex flex-col shrink-0">
      <div className="sidebar-header px-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="flex flex-col justify-center">
            <h1 className="logo-title">
              <span className="text-slate-800">Career</span> <span className="text-primary">Pathway</span>
            </h1>
            <p className="logo-subtitle text-gray-500 mt-1">AI Career Partner</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav flex-1 px-4 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={18} className="shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer p-4" />
    </aside>
  );
};

export default Sidebar;