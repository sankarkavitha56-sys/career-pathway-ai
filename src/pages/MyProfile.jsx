import React, { useState, useRef } from 'react';
import { User, Mail, LinkIcon, MapPin, Briefcase, Code, Plus, X, Camera } from 'lucide-react';
import './MyProfile.css';

const INITIAL_SKILLS = [ 'Node.js', 'Tailwind CSS'];

const MyProfile = () => {
  const [skills, setSkills]     = useState(INITIAL_SKILLS);
  const [newSkill, setNewSkill] = useState('');
  const [avatar, setAvatar]     = useState(null);   // base64 or null → shows initials
  const [saved, setSaved]       = useState(false);
  const fileRef                 = useRef();

  // ── skill helpers ────────────────────────────────────────────
  const handleAddSkill = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  // ── photo upload ────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── save (mock) ─────────────────────────────────────────────
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl">

      {/* ── page header ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">My Profile</h1>
          <p className="text-gray-500 text-sm">Manage your personal information and career preferences.</p>
        </div>
        <button className="btn-primary px-6 py-2 shadow-btn" onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-8 profile-layout">

        {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Personal Information */}
          <div className="card form-card">
            <h3 className="form-section-title">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input type="text" className="form-input text-sm" defaultValue="Alex Johnson" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input type="email" className="form-input text-sm" defaultValue="alex.johnson@example.com" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input type="text" className="form-input text-sm" defaultValue="San Francisco, CA" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio URL</label>
                <div className="input-with-icon">
                  <LinkIcon size={16} className="input-icon" />
                  <input type="url" className="form-input text-sm" defaultValue="https://alexj.dev" />
                </div>
              </div>

            </div>

            <div className="form-group mt-4">
              <label className="form-label">Professional Summary</label>
              <textarea
                className="form-textarea text-sm"
                rows={4}
                defaultValue="Experienced Frontend Developer specializing in React and modern JavaScript. Passionate about building accessible, performant, and beautiful user interfaces."
              />
            </div>
          </div>

          {/* Career Preferences */}
          <div className="card form-card">
            <h3 className="form-section-title">Career Preferences</h3>
            <div className="grid grid-cols-2 gap-4">

              <div className="form-group">
                <label className="form-label">Target Role</label>
                <div className="input-with-icon">
                  <Briefcase size={16} className="input-icon" />
                  <input type="text" className="form-input text-sm" defaultValue="Senior UI Developer" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Salary (USD)</label>
                <input type="text" className="form-input text-sm" defaultValue="$120,000 – $150,000" />
              </div>

              <div className="form-group">
                <label className="form-label">Work Model</label>
                <select className="form-input text-sm">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-input text-sm">
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Freelance</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR ════════════════════════════════════════ */}
        <div className="sidebar-profile w-80 shrink-0 flex flex-col gap-6">

          {/* Avatar card */}
          <div className="card form-card text-center flex flex-col items-center">
            <div className="profile-img-lg mb-4" onClick={() => fileRef.current.click()}>
              {avatar
                ? <img src={avatar} alt="Profile" />
                : <span className="profile-initials">AJ</span>}
              <button className="img-edit-btn" type="button" title="Change photo">
                <Camera size={13} />
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />

            <h3 className="font-bold text-slate-800 text-lg">Alex Johnson</h3>
            <p className="text-sm text-gray-500 mb-4">Frontend Engineer</p>
            <button className="btn-outline w-full text-sm" onClick={() => fileRef.current.click()}>
              Upload New Photo
            </button>
          </div>

          {/* Skills card */}
          <div className="card form-card">
            <h3 className="font-bold text-slate-800 text-md flex items-center gap-2 mb-1">
              <Code size={16} className="text-primary" /> Skills
            </h3>
            <p className="text-xs text-gray-500 mb-3">Add skills to improve your job match score.</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="skill-remove-btn" title="Remove">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="input-with-icon">
              <Plus size={16} className="input-icon" />
              <input
                type="text"
                className="form-input text-sm"
                placeholder="Type skill & press Enter"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
              />
            </div>

            {skills.length === 0 && (
              <p className="text-xs text-gray-400 mt-3 text-center">No skills added yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;