import React, { useState, useRef } from 'react';
import {
  UploadCloud, FileText,
  X, Check, AlertCircle, HelpCircle, Wrench
} from 'lucide-react';
import './ResumeAnalyzer.css';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ── Simple Hash Function for Caching ──────────────────────────────────────
const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

async function analyzeWithGroq(resumeText, jobDescription) {
  const hasJD = !!jobDescription?.trim();
  const jdSection = hasJD
    ? `Job Description:\n${jobDescription.trim()}`
    : 'No job description provided — perform a general ATS best-practices audit.';

  // ── Check Cache ─────────────────────────────────────────────────────────
  const cacheKey = `resume_analysis_${cyrb53(resumeText + '|' + (jobDescription || ''))}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log('✅ Serving analysis from cache');
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('Cache read error:', err);
  }

  // ── Industry-standard hybrid ATS formula ──────────────────────────────────
  // ATS = 0.6 × ResumeQuality + 0.4 × JDMatch
  // ResumeQuality → 4-pillar rubric (Content, Key Sections, Structure, Comprehensiveness)
  // JDMatch       → keyword & semantic alignment with the job description
  // When no JD provided → totalScore = resumeQuality (JD component not applicable)
  const fullPrompt = `
You are an expert ATS Resume Evaluator and Career Coach with knowledge of HR recruiting systems.

Analyze the resume below ${hasJD ? 'against the provided job description' : 'using general ATS best-practices'}.

${jdSection}

Resume Text:
${resumeText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING FRAMEWORK — Industry Hybrid ATS Model
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT 1 — RESUME QUALITY (scale 0-100)
Evaluate across 4 Core Pillars, then normalise to 0-100:
  Pillar 1 · CONTENT         (35 pts): Customization(10), Spelling & Grammar(10), Word Choice(15)
  Pillar 2 · KEY SECTIONS    (30 pts): Contact Info(8), Professional Summary(10), Measurable Results(12)
  Pillar 3 · STRUCTURE       (20 pts): Formatting(12), Optimal Length(8)
  Pillar 4 · COMPREHENSIVENESS(15 pts): Key Sections Included(8), Complete Work History(7)

COMPONENT 2 — JD MATCH (scale 0-100)${hasJD ? `
Score how well the resume aligns with the provided job description based on:
  • Hard-skill keyword coverage (tools, technologies, frameworks)
  • Soft-skill language alignment
  • Role responsibility mirroring
  • Seniority & domain relevance` : `
No JD provided. Set jdMatch to null.`}

FINAL ATS FORMULA:
${hasJD
  ? '  totalScore = Math.round(0.6 × resumeQuality + 0.4 × jdMatch)'
  : '  totalScore = resumeQuality  (jdMatch not applicable — no JD provided)'}
rating: Excellent ≥ 90 | Good ≥ 75 | Average ≥ 60 | else Poor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return EXACTLY this JSON — no extra text:
{
  "resumeQuality": <integer 0-100>,
  "jdMatch": ${hasJD ? '<integer 0-100>' : 'null'},
  "totalScore": <integer — computed by the formula above>,
  "rating": "<Excellent | Good | Average | Poor>",
  "pillars": {
    "content": {
      "score": <number>, "max": 35, "label": "Content", "rating": "<✅ | ⚠️ | ❌>",
      "sub": [
        { "label": "Customization",     "score": <number>, "max": 10 },
        { "label": "Spelling & Grammar", "score": <number>, "max": 10 },
        { "label": "Word Choice",        "score": <number>, "max": 15 }
      ]
    },
    "keySections": {
      "score": <number>, "max": 30, "label": "Key Sections", "rating": "<✅ | ⚠️ | ❌>",
      "sub": [
        { "label": "Contact Information",    "score": <number>, "max": 8  },
        { "label": "Professional Summary",   "score": <number>, "max": 10 },
        { "label": "Measurable Results",     "score": <number>, "max": 12 }
      ]
    },
    "structure": {
      "score": <number>, "max": 20, "label": "Structure", "rating": "<✅ | ⚠️ | ❌>",
      "sub": [
        { "label": "Formatting",     "score": <number>, "max": 12 },
        { "label": "Optimal Length", "score": <number>, "max": 8  }
      ]
    },
    "comprehensiveness": {
      "score": <number>, "max": 15, "label": "Comprehensiveness", "rating": "<✅ | ⚠️ | ❌>",
      "sub": [
        { "label": "Key Sections Included",  "score": <number>, "max": 8 },
        { "label": "Complete Work History",  "score": <number>, "max": 7 }
      ]
    }
  },
  "strengths": [<string>, ...],
  "criticalIssues": [<string>, ...],
  "recommendations": {
    "content":           [<Detailed actionable tip>, ...],
    "keySections":       [<Detailed actionable tip>, ...],
    "structure":         [<Detailed actionable tip>, ...],
    "comprehensiveness": [<Detailed actionable tip>, ...]
  },
  "keywords": {
    "found":   [<string>, ...],
    "missing": [<string>, ...]
  }
}

RULE: In recommendations, provide HIGHLY DETAILED actionable advice per pillar. Return [] for any pillar that is perfect.
Do not return anything other than the JSON object.
`.trim();

  const response = await fetch(
    `https://api.groq.com/openai/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are an expert ATS analyzer. Always return a valid JSON object matching the requested schema exactly. Never omit resumeQuality, jdMatch, or totalScore fields." },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content ?? '';
  const parsed = JSON.parse(rawText.trim());

  // Safety: recalculate totalScore client-side to guarantee formula correctness
  const rq = parsed.resumeQuality ?? parsed.totalScore ?? 0;
  const jd = parsed.jdMatch ?? null;
  parsed.resumeQuality = rq;
  parsed.jdMatch = jd;
  parsed.totalScore = jd !== null
    ? Math.round(0.6 * rq + 0.4 * jd)
    : rq;
  parsed.rating = parsed.totalScore >= 90 ? 'Excellent'
    : parsed.totalScore >= 75 ? 'Good'
    : parsed.totalScore >= 60 ? 'Average' : 'Poor';

  try {
    localStorage.setItem(cacheKey, JSON.stringify(parsed));
  } catch (err) {
    console.warn('Cache write error:', err);
  }

  return parsed;
}

const ResumeAnalyzer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      console.error('[Resume Analyzer] Only PDF files are supported.');
      event.target.value = '';
      return;
    }
    setUploadedFile(file);
    event.target.value = '';
  };

  const handleRemoveFile = () => setUploadedFile(null);

  const handleParsePdf = async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    if (!uploadedFile) return;

    setParsing(true);
    setLoadingMessage('Initializing ATS parser...');
    await delay(1000);

    setAnalysisError(null);
    let extractedText = '';
    try {
      setLoadingMessage('Scanning document layers and metadata...');
      await delay(1200);

      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setLoadingMessage(`Extracting content from ${pdf.numPages} page(s)...`);
      await delay(1000);

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        extractedText += ' ' + content.items.map(item => item.str).join(' ');
      }
    } catch (err) {
      console.error('[PDF Parser] Failed to parse PDF:', err);
      setParsing(false);
      return;
    } finally {
      setParsing(false);
    }

    setAnalyzing(true);
    setLoadingMessage('Identifying industry patterns and key competencies...');
    await delay(1500);

    try {
      setLoadingMessage('Consulting high-performing resume benchmarks...');
      await delay(1500);

      const result = await analyzeWithGroq(extractedText, jobDescription);
      
      setLoadingMessage('Finalizing scoring audit and feedback tips...');
      await delay(1000);

      console.log('✅ Groq ATS Result:', result);

      if (result && typeof result.totalScore === 'number') {
        setData(result);
        setIsFlipped(false);
      } else {
        console.error('[Groq] Unexpected JSON structure returned:', result);
      }
    } catch (err) {
      console.error('[Groq] Analysis failed:', err);
      setAnalysisError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
      setLoadingMessage('');
    }
  };

  const getBtnLabel = () => {
    if (parsing) return 'Parsing...';
    if (analyzing) return 'Analyzing...';
    return 'Parse';
  };

  const getScoreColorClass = (score) => {
    if (!score && score !== 0) return 'score-gray';
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-good';
    if (score >= 60) return 'score-average';
    return 'score-poor';
  };

  const getPillarHeader = (key) => {
    if (key === 'content') return 'Content Tips';
    if (key === 'keySections') return 'Key Sections Tips';
    if (key === 'structure') return 'Structure Tips';
    if (key === 'comprehensiveness') return 'Comprehensiveness Tips';
    return key;
  };

  const isBusy = parsing || analyzing;

  return (
    <div className="p-8 max-w-7xl dashboard-container">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Resume Analyzer</h1>
          <p className="text-gray-500 text-sm">Upload your resume for a 100-point 4-pillar scores model analysis.</p>
        </div>
        <div className="flex gap-3 align-center">
          <button onClick={handleUploadClick} disabled={isBusy} className="btn-outline flex items-center gap-2 px-5 py-2"><UploadCloud size={18} /> {uploadedFile ? 'Change' : 'Upload'}</button>
          <input type="file" accept=".pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          <button onClick={handleParsePdf} disabled={!uploadedFile || isBusy} className={`btn-primary px-5 py-2 shadow-btn flex items-center gap-2 ${!uploadedFile ? 'btn-disabled' : ''}`}>{getBtnLabel()}</button>
        </div>
      </div>

      {uploadedFile && (
        <div className="file-chip mb-4">
          <FileText size={16} className="icon-indigo" /><span className="file-chip-name">{uploadedFile.name}</span>
          <button onClick={handleRemoveFile} className="file-chip-remove"><X size={14} /></button>
        </div>
      )}

      <div className="card analyzer-card mb-6">
        <textarea className="jd-textarea" placeholder="Paste target job description here (Optional)..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} disabled={isBusy} />
      </div>

      {/* ── Error state ────────────────────────────────────────────────── */}
      {analysisError && (
        <div className="error-banner mb-6">
          <AlertCircle size={20} className="text-red-500" />
          <p className="error-message">{analysisError}</p>
          <button onClick={() => setAnalysisError(null)} className="error-close"><X size={16} /></button>
        </div>
      )}

      {/* ── Analyzing overlay ─────────────────────────────────────────── */}
      {isBusy && (
        <div className="analyzing-overlay">
          <div className="analyzing-spinner" />
          <p className="analyzing-label">{loadingMessage}</p>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!data && !isBusy && (
        <div className="empty-state">
          <UploadCloud size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">No resume analyzed yet</h2>
          <p className="empty-state-sub">Upload a PDF above and click <strong>Parse</strong> to run the ATS scoring engine.</p>
        </div>
      )}

      {/* ── MAIN DASHBOARD ─────────────────────────────────────────────── */}
      {data && !isBusy && <div className="grid grid-cols-12 gap-6 align-start resume-grid">

        {/* ── LEFT COLUMN: Score & Pillar Sidebar Breakdown ─────────────── */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="card analyzer-card text-center flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">ATS Score</h3>
            <div className="relative flex items-center justify-center mt-2 mb-1" style={{ width: '120px', height: '120px' }}>
              <svg height="120" width="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="52" stroke="#f1f5f9" strokeWidth="7" fill="none" />
                <circle
                  cx="60" cy="60" r="52"
                  className={getScoreColorClass(data?.totalScore)}
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 - (326.7 * (data?.totalScore ?? 0)) / 100}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <span className="absolute flex flex-col items-center justify-center">
                <span style={{ fontSize: '2rem', fontWeight: 600, color: '#1e293b', lineHeight: 1 }}>{data?.totalScore ?? 0}</span>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>/ 100</span>
              </span>
            </div>
            <div className="mb-3"><span className={`rating-badge ${getScoreColorClass(data?.totalScore)}`}>{data?.rating ?? 'Unknown'}</span></div>

            {/* ── Hybrid Formula Breakdown ─────────────────────────────── */}
            <div className="ats-formula-box w-full">
              <div className="ats-formula-title">Score Composition</div>
              <div className="ats-formula-row">
                <span className="ats-formula-label">Resume Quality</span>
                <span className="ats-formula-weight">×0.6</span>
                <span className={`ats-formula-val ${getScoreColorClass(data?.resumeQuality)}`}>{data?.resumeQuality ?? '—'}</span>
              </div>
              <div className="ats-formula-row">
                <span className="ats-formula-label">JD Match</span>
                <span className="ats-formula-weight">×0.4</span>
                <span className={`ats-formula-val ${data?.jdMatch !== null && data?.jdMatch !== undefined ? getScoreColorClass(data?.jdMatch) : 'score-gray'}`}>
                  {data?.jdMatch !== null && data?.jdMatch !== undefined ? data.jdMatch : 'N/A'}
                </span>
              </div>
              <div className="ats-formula-divider" />
              <div className="ats-formula-row ats-formula-total">
                <span className="ats-formula-label" style={{ fontWeight: 800 }}>Final ATS</span>
                <span className="ats-formula-weight" style={{ color: '#3b82f6', fontWeight: 700 }}>
                  {data?.jdMatch !== null && data?.jdMatch !== undefined ? '=0.6+0.4' : '=Quality'}
                </span>
                <span className={`ats-formula-val ${getScoreColorClass(data?.totalScore)}`} style={{ fontWeight: 800 }}>{data?.totalScore ?? 0}</span>
              </div>
              {data?.jdMatch === null && (
                <p className="ats-formula-note">Add a JD above to enable full hybrid scoring</p>
              )}
            </div>
          </div>

          <div className="pillar-card-wrapper-single" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`pillar-card-inner ${isFlipped ? 'is-flipped' : ''}`}>

              {/* Front: Summary Breakdown List */}
              <div className="pillar-card-front card analyzer-card flex flex-col justify-start">
                <h3 className="text-xs font-bold text-slate-800 mb-4">Pillar Breakdown</h3>
                <div className="w-full flex flex-col gap-2 mt-2" style={{ flex: 1 }}>
                  <div className="flex items-center justify-between text-xxs font-extrabold text-slate-400 border-bottom pb-1">
                    <div className="flex-1">Pillar</div><div className="w-14 text-right">Score</div>
                  </div>
                  {data?.pillars && Object.entries(data.pillars).map(([key, pillar]) => (
                    <div key={key} className="flex items-center justify-between text-xs text-slate-700 py-2 border-bottom-dashed">
                      <div className="font-bold text-slate-800 flex-1 truncate">{pillar.label}</div>
                      <div className="w-14 text-right font-bold text-slate-800">{pillar.score} <span className="text-slate-400 font-normal">/ {pillar.max}</span></div>
                    </div>
                  ))}
                </div>
                <p className="card-flip-hint">Click to see sub-scores</p>
              </div>

              {/* Back: Detail List itemisation stacked vertically */}
              <div className="pillar-card-back card analyzer-card flex flex-col">
                <h3 className="text-xs font-bold text-slate-800 mb-3">Sub-Score Detail</h3>
                <div
                  className="flex flex-col gap-3 w-full no-scrollbar"
                  style={{ flex: 1, overflowY: 'scroll', minHeight: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {data?.pillars && Object.entries(data.pillars).map(([key, pillar]) => (
                    <div key={key} className="flex flex-col gap-1.5 border-bottom pb-1.5">
                      <h4 className="text-xxs font-extrabold uppercase text-slate-500">{pillar.label} Details</h4>
                      <div className="flex flex-col gap-1.5">
                        {pillar.sub?.map((item, id) => {
                          const percent = (item.score / item.max) * 100;
                          return (
                            <div key={id} className="measure-row">
                              <div className="flex justify-between text-xxs font-bold text-slate-600"><span>{item.label}</span><span>{item.score}/{item.max}</span></div>
                              <div className="measure-track"><div className="measure-bar" style={{ width: `${percent}%` }}></div></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="card-flip-hint">Click to go back</p>
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Supporting Results Dashboard ───────────────── */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card analyzer-card bg-green-50-soft">
              <h3 className="text-sm font-bold text-green-700 flex items-center gap-2 mb-3"><Check size={18} /> Strengths</h3>
              <ul className="list-disc list-inside text-slate-800 text-sm flex flex-col gap-1">{data?.strengths?.map((str, i) => <li key={i}>{str}</li>)}</ul>
            </div>
            <div className="card analyzer-card bg-red-50-soft">
              <h3 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-3"><AlertCircle size={18} /> Critical Issues</h3>
              <ul className="list-disc list-inside text-slate-800 text-sm flex flex-col gap-1">{data?.criticalIssues?.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
            </div>
          </div>

          <div className="card analyzer-card">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><HelpCircle size={18} className="text-indigo-500" /> Keywords Audit</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><h4 className="text-xs font-bold text-green-600 uppercase mb-2">Matched</h4><div className="flex flex-wrap gap-1.5">{data?.keywords?.found?.map((word, i) => <span key={i} className="tag tag-success">{word}</span>)}</div></div>
              <div><h4 className="text-xs font-bold text-orange-600 uppercase mb-2">Missing</h4><div className="flex flex-wrap gap-1.5">{data?.keywords?.missing?.map((word, i) => <span key={i} className="tag tag-warning">{word}</span>)}</div></div>
            </div>
          </div>

          <div className="card analyzer-card">
            <h3 className="text-sm font-bold text-slate-800 mb-4"><Wrench size={14} className="text-blue-500 inline mr-2" /> Tips to Improve</h3>
            <div className="flex flex-col gap-5">
              {data?.recommendations && Object.entries(data.recommendations).map(([key, tips], pillarId) => (
                tips && tips.length > 0 && (
                  <div key={key} className="flex flex-col gap-2">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1.5">
                      • {getPillarHeader(key)}
                    </h4>
                    <div className="flex flex-col gap-2 pl-1">
                      {tips.map((tip, i) => (
                        <div key={i} className="suggestion-item">
                          <div className="suggestion-number">{i + 1}</div>
                          <div className="text-slate-800 text-sm font-medium">{tip}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

      </div>}

    </div>
  );
};

export default ResumeAnalyzer;
