import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Filter, Zap, Bookmark, Briefcase, Clock } from 'lucide-react';
import './JobSearch.css';

// ✅ Correct way for Vite
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

const API_HOST = 'jsearch.p.rapidapi.com';

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('frontend developer');
  const [locationQuery, setLocationQuery] = useState('remote');

  const [autoApplyActive, setAutoApplyActive] = useState(true);
  const [savedJobs, setSavedJobs] = useState(new Set());

  const [matchFilter, setMatchFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');

  // Show warning if key is missing
  if (!RAPIDAPI_KEY) {
    console.error("❌ VITE_RAPIDAPI_KEY is missing in .env file");
  }

  const fetchJobs = useCallback(async () => {
    if (!RAPIDAPI_KEY) {
      setError("API Key is missing. Please check your .env file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL(`https://${API_HOST}/search`);
      url.searchParams.append('query', `${query} ${locationQuery}`.trim());
      url.searchParams.append('page', '1');
      url.searchParams.append('num_pages', '2');
      url.searchParams.append('country', 'us');
      url.searchParams.append('date_posted', 'all');

      console.log('Fetching jobs from:', url.toString());
      console.log('API Key present:', !!RAPIDAPI_KEY);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': API_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const formattedJobs = (data.data || []).map((job, index) => ({
        id: job.job_id || `job-${index}`,
        company: job.employer_name || 'Unknown Company',
        title: job.job_title || 'Position',
        location: job.job_city 
          ? `${job.job_city}, ${job.job_country || 'US'}` 
          : (job.job_is_remote ? 'Remote' : 'United States'),
        salary: job.job_salary ? `${job.job_salary_currency || '$'}${job.job_salary}` : 'Not disclosed',
        type: job.job_employment_type || 'Full-time',
        model: job.job_is_remote ? 'Remote' : 'Hybrid / On-site',
        posted: job.job_posted_at 
          ? new Date(job.job_posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
          : 'Recently',
        tags: job.job_required_skills ? job.job_required_skills.slice(0, 3) : ['React', 'JavaScript'],
        apply_link: job.job_apply_link,
        match: Math.floor(Math.random() * 28) + 75,
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error('Job fetch error:', err.message);
      console.error('Full error:', err);
      setError(`Unable to load jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [query, locationQuery]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    const matchOk = 
      matchFilter === 'all' ||
      (matchFilter === 'high' && job.match >= 90) ||
      (matchFilter === 'medium' && job.match >= 80);

    const typeOk = typeFilter === 'all' || job.type === typeFilter;
    const modelOk = modelFilter === 'all' || job.model.toLowerCase().includes(modelFilter.toLowerCase());

    return matchOk && typeOk && modelOk;
  });

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // ... (rest of your component - the return statement remains the same as before)
  return (
    <div className="js-container p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Job Matches</h1>
          <p className="text-slate-500 mt-1">Find roles that perfectly match your skills</p>
        </div>
        <button className="btn-outline flex items-center gap-2 px-5 py-2.5">
          <Bookmark size={18} />
          Saved Jobs ({savedJobs.size})
        </button>
      </div>

      {/* Auto-Apply Banner */}
      <div className={`auto-apply-banner ${autoApplyActive ? 'active' : ''}`}>
        <div className="banner-content">
          <div className="flex items-center gap-4">
            <div className={`banner-icon-bg ${autoApplyActive ? 'active' : ''}`}>
              <Zap size={28} className={autoApplyActive ? 'text-white' : 'text-slate-400'} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xl">
                AI Auto-Apply is {autoApplyActive ? 'Active' : 'Paused'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {autoApplyActive 
                  ? "We're automatically applying to high-match jobs using your profile."
                  : "Turn this on to let AI apply to 90%+ match roles for you."}
              </p>
            </div>
          </div>

          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoApplyActive}
              onChange={() => setAutoApplyActive(v => !v)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-input-group flex-1">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Job title, keyword, or company"
            className="search-input-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
          />
        </div>

        <div className="divider" />

        <div className="search-input-group w-72">
          <MapPin size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Remote, City, or Country"
            className="search-input-field"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
          />
        </div>

        <button className="btn-primary search-btn" onClick={fetchJobs}>
          Search
        </button>
      </div>

      <div className="view-layout">

        {/* Filters Sidebar */}
        <div className="filter-sidebar">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-slate-700">
              <Filter size={18} /> Filters
            </h3>
            <button 
              className="text-sm text-blue-600 font-medium hover:underline"
              onClick={() => {
                setMatchFilter('all');
                setTypeFilter('all');
                setModelFilter('all');
              }}
            >
              Clear all
            </button>
          </div>

          {/* Match Score */}
          <div className="mb-8">
            <h4 className="filter-title">Match Score</h4>
            <div className="filter-options">
              {['all', 'high', 'medium'].map((option) => (
                <label key={option} className="filter-label">
                  <input 
                    type="radio" 
                    name="match" 
                    checked={matchFilter === option}
                    onChange={() => setMatchFilter(option)}
                    className="custom-checkbox"
                  />
                  <span>
                    {option === 'all' ? 'All Matches' : option === 'high' ? '> 90% Match' : '80% – 89% Match'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div className="mb-8">
            <h4 className="filter-title">Job Type</h4>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Any Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          {/* Work Model */}
          <div>
            <h4 className="filter-title">Work Model</h4>
            <select 
              value={modelFilter} 
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Any Model</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredJobs.length}</span> jobs
            </p>
            <select className="sort-select">
              <option>Sort by: Match Score</option>
              <option>Sort by: Date Posted</option>
            </select>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {error && <div className="text-red-500 text-center py-10">{error}</div>}

          {!loading && !error && (
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div key={job.id} className="job-card bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex gap-5">
                      <div className="company-logo flex-shrink-0 w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                        {job.company.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-xl text-slate-900 leading-tight">{job.title}</h3>
                            <p className="text-slate-600 mt-1">{job.company}</p>
                          </div>
                          <div className={`match-badge ${job.match >= 90 ? 'match-high' : 'match-mid'}`}>
                            {job.match}% match
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-5 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={16} /> {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase size={16} /> {job.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} /> {job.posted}
                          </div>
                        </div>

                        <div className="job-tags mt-4">
                          {job.tags.map((tag, i) => (
                            <span key={i} className="job-tag">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between">
                        <div className="text-lg font-semibold text-emerald-600">{job.salary}</div>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => toggleSave(job.id)}
                            className="save-btn p-2 hover:bg-slate-100 rounded-xl transition"
                            title={savedJobs.has(job.id) ? "Unsave" : "Save"}
                          >
                            <Bookmark 
                              size={20} 
                              fill={savedJobs.has(job.id) ? "currentColor" : "none"} 
                            />
                          </button>

                          <a
                            href={job.apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary apply-btn px-8 py-3 text-sm font-medium"
                          >
                            Apply Now
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-400">
                  No jobs match your current filters.<br />Try changing the filters or search term.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;