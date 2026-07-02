import React, { useState, useEffect } from 'react';
import {
  Code, Users, FileText, Clock, BarChart, ArrowRight, ArrowLeft,
  Send, Maximize2, X, Lightbulb, CheckCircle2, AlertTriangle, RefreshCcw, Bell, Search, User, Loader2
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import './MockInterviews.css';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const interviewTypes = [
  {
    id: 'technical',
    title: 'Technical Interview',
    type: 'technical',
    tag: '',
    desc: 'Focus on data structures, algorithms, and system design principles.',
    duration: '45-60m',
    level: '',
    icon: Code,
    colorClass: 'technical'
  },
  {
    id: 'behavioral',
    title: 'HR & Behavioral',
    type: 'behavioral',
    tag: '',
    desc: 'Practice behavioral questions and cultural fit exercises using the STAR method.',
    duration: '30-40m',
    level: '',
    icon: Users,
    colorClass: 'behavioral'
  },
  {
    id: 'resume',
    title: 'Resume-Based',
    type: 'resume',
    tag: '',
    desc: 'Practice questions tailored specifically to your background and experience listed in your resume.',
    duration: 'Personalized',
    level: '',
    icon: FileText,
    colorClass: 'resume'
  }
];

const departments = [
  "DSA",
  "Front End",
  "Back End",
  "Cloud Computing",
  "Database",
  "AI/ML",
  "DevOps",
  "UI/UX"
];

// Fallback questions if API fails
const fallbackQuestions = [
  { id: 1, text: "Explain a difficult technical concept you recently learned.", tip: "Use analogies and structured explanation." },
  { id: 2, text: "How do you handle technical debt?", tip: "Discuss balance of shipping fast vs writing clean code." }
];

const MockInterviews = () => {
  const [currentView, setCurrentView] = useState('selection'); // 'selection', 'departmentSelection', 'loading', 'interview', 'feedback'
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [loadingText, setLoadingText] = useState('Loading...');

  // Interview State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [answer, setAnswer] = useState('');

  // Feedback Data
  const [feedbackData, setFeedbackData] = useState(null);

  const handleStartInterviewSelection = (type) => {
    setSelectedType(type);
    if (type.id === 'technical') {
      setCurrentView('departmentSelection');
    } else if (type.id === 'behavioral') {
      handleBehavioralTest();
    } else if (type.id === 'resume') {
      handleResumeInterview();
    } else {
      // Direct jump for others
      setSelectedDept('');
      setQuestions(fallbackQuestions);
      setCurrentView('interview');
      setCurrentQuestionIdx(0);
      setAnswer('');
      setUserAnswers({});
    }
  };

  const handleResumeInterview = async () => {
    setCurrentView('loading');
    setLoadingText('Scanning for your resume data...');

    let resumeText = '';
    try {
      // Find latest resume analysis in localStorage
      const keys = Object.keys(localStorage);
      const resumeKeys = keys.filter(k => k.startsWith('resume_analysis_')).sort().reverse();

      if (resumeKeys.length > 0) {
        const cached = JSON.parse(localStorage.getItem(resumeKeys[0]));
        // We need the raw text. ResumeAnalyzer doesn't store the raw text in the cached object, 
        // but we can derive context from the analysis (strengths, keywords, etc) 
        // or prompt Groq to generate general questions if the text is missing.
        // For a better experience, we'll assume the user might have text in a 'rawText' field if we add it,
        // or we'll just use the analysis summary as context.
        resumeText = cached.summary || '';
        const keywords = cached.keywords?.found?.join(', ') || '';
        const strengths = cached.strengths?.join(', ') || '';

        setLoadingText('Generating interview questions based on your resume...');

        const prompt = `You are an expert technical and behavioral interviewer. I will provide you with a summary of a candidate's resume analysis. Generate exactly 10 interview questions tailored to the candidate's background, skills, and strengths mentioned.
        
Candidate Context:
- Keywords found: ${keywords}
- Strengths: ${strengths}
- Summary: ${resumeText}

For each question, provide:
1. "text": The interview question specifically probing their claimed experience or skills.
2. "tip": A hint on how to elaborate on their specific background for this question.

Return ONLY valid JSON matching this format exactly:
{
  "questions": [
    { "id": 1, "text": "...", "tip": "..." },
    ...
  ]
}`;

        const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: "You output JSON only." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) throw new Error('Failed to generate questions');
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);

        setSelectedDept('Resume-Based');
        setQuestions(parsed.questions || fallbackQuestions);
        setCurrentView('interview');
        setCurrentQuestionIdx(0);
        setAnswer('');
        setUserAnswers({});
      } else {
        // No resume found
        alert('No analyzed resume found. Please go to the Resume Analyzer and parse your resume first!');
        setCurrentView('selection');
      }
    } catch (e) {
      console.error(e);
      alert('Error generating resume-based questions. Make sure you have analyzed a resume first.');
      setCurrentView('selection');
    }
  };

  const handleBehavioralTest = async () => {
    setSelectedDept('HR & Behavioral');
    setCurrentView('loading');
    setLoadingText('Generating behavioral questions...');

    try {
      const prompt = `You are an expert HR and Behavioral interviewer. Generate exactly 10 comprehensive behavioral interview questions to assess a candidate's soft skills, cultural fit, and past experiences using the STAR method.
Provide for each question:
1. "text": The interview question.
2. "tip": A helpful tip or hint on how the user should structure their answer (e.g., using the STAR method).

Return ONLY valid JSON matching this format exactly:
{
  "questions": [
    { "id": 1, "text": "...", "tip": "..." },
    ...
  ]
}`;

      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You output JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      setQuestions(parsed.questions || fallbackQuestions);
      setCurrentView('interview');
      setCurrentQuestionIdx(0);
      setAnswer('');
      setUserAnswers({});
    } catch (e) {
      console.error(e);
      setQuestions(fallbackQuestions);
      setCurrentView('interview');
    }
  };

  const handleStartTest = async () => {
    if (!selectedDept) return;
    setCurrentView('loading');
    setLoadingText(`Generating technical questions for ${selectedDept}...`);

    try {
      const prompt = `You are an expert technical interviewer. Generate exactly 10 comprehensive interview questions for a candidate specializing in the "${selectedDept}" department/field. 
Provide for each question:
1. "text": The interview question.
2. "tip": A helpful tip or hint on how the user should structure their answer.

Return ONLY valid JSON matching this format exactly:
{
  "questions": [
    { "id": 1, "text": "...", "tip": "..." },
    ...
  ]
}`;

      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You output JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      setQuestions(parsed.questions || fallbackQuestions);
      setCurrentView('interview');
      setCurrentQuestionIdx(0);
      setAnswer('');
      setUserAnswers({});
    } catch (e) {
      console.error(e);
      setQuestions(fallbackQuestions); // fallback if api fails
      setCurrentView('interview');
    }
  };

  const handleAnswerSubmit = () => {
    setUserAnswers(prev => ({ ...prev, [currentQuestionIdx]: answer }));

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(p => p + 1);
      // Load next existing answer or blank
      setAnswer(userAnswers[currentQuestionIdx + 1] || '');
    } else {
      handleCompleteInterview();
    }
  };

  const handleCompleteInterview = async () => {
    // Save current answer
    const finalAnswers = { ...userAnswers, [currentQuestionIdx]: answer };
    setUserAnswers(finalAnswers);

    setCurrentView('loading');
    setLoadingText('Evaluating your answers. Please wait...');

    try {
      const isBehavioral = selectedDept === 'HR & Behavioral';
      const prompt = `You are an expert ${isBehavioral ? 'HR and Behavioral' : 'technical'} interviewer. Evaluate the candidate's answers for a ${selectedDept || 'general'} role.
      
Here are the questions and the candidate's responses:
${questions.map((q, i) => `Q${i + 1}: ${q.text}\nCandidate Answer: ${finalAnswers[i] || "NO ANSWER GIVEN"}`).join('\n\n')}

Evaluate their performance and return ONLY this JSON structure exactly:
{
  "overallScore": <integer 1-10>,
  "scoreText": "<EXCELLENT | GOOD | AVERAGE | POOR>",
  "summary": "<2-3 sentences summarizing their performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "competencies": [
    { "subject": "Knowledge", "score": <0-100> },
    { "subject": "Communication", "score": <0-100> },
    { "subject": "Accuracy", "score": <0-100> },
    { "subject": "Problem Solving", "score": <0-100> },
    { "subject": "Clarity", "score": <0-100> }
  ]
}`;

      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You output JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) throw new Error('Failed to evaluate answers');
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      setFeedbackData(parsed);
      setCurrentView('feedback');
    } catch (e) {
      console.error(e);
      // Mock feedback if error
      setFeedbackData({
        overallScore: 6,
        scoreText: "AVERAGE",
        summary: "There was an error connecting to the AI, here is a default summary.",
        strengths: ["You completed the test", "Good effort"],
        improvements: ["Try again when network is stable", "Provide detailed answers"]
      });
      setCurrentView('feedback');
    }
  };

  const renderSelection = () => (
    <div className="mock-interviews-container">
      <div className="mi-header">
        <h1>Select Interview Type</h1>
        <p>Choose a specialized track to practice your skills and get instant AI-powered feedback.</p>
      </div>

      <div className="mi-options-grid">
        {interviewTypes.map((opt) => (
          <div key={opt.id} className="mi-option-card">
            <div className={`mi-option-header ${opt.colorClass}`}>
              <opt.icon size={48} />
            </div>
            <div className="mi-option-body">
              <div className="mi-option-title-row">
                <h3 className="mi-option-title">{opt.title}</h3>
                {opt.tag && <span className="mi-badge">{opt.tag}</span>}
              </div>
              <p className="mi-option-desc">{opt.desc}</p>

              <button
                className="mi-start-btn"
                onClick={() => handleStartInterviewSelection(opt)}
              >
                Select Track <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDepartmentSelection = () => {
    // Circle layout calculations
    const radius = 140; // radius of the circle

    return (
      <div className="mock-interviews-container">
        <div className="mi-header">
          <button className="mi-back-btn mb-4" onClick={() => setCurrentView('selection')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Select Department</h1>
          <p>Choose your tech domain. We'll generate specialized questions for your track.</p>
        </div>

        <div className="mi-dept-layout">
          <div className="mi-dept-circle-wrap">
            <div className="mi-dept-center">
              <Code size={32} />
            </div>

            {departments.map((dept, index) => {
              const angle = (index / departments.length) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isSelected = selectedDept === dept;

              return (
                <div
                  key={dept}
                  className={`mi-dept-item ${isSelected ? 'selected' : ''}`}
                  style={{ transform: `translate(${x}px, ${y}px) scale(${isSelected ? 1.15 : 1})` }}
                  onClick={() => setSelectedDept(dept)}
                >
                  {dept}
                </div>
              );
            })}
          </div>

          <button
            className="mi-start-btn"
            style={{ maxWidth: '300px', marginTop: '2rem', opacity: selectedDept ? 1 : 0.5 }}
            onClick={handleStartTest}
            disabled={!selectedDept}
          >
            Start Test <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="mock-interviews-container">
      <div className="mi-loading-overlay">
        <div className="mi-spinner"></div>
        <h2 className="text-xl font-bold text-slate-800">{loadingText}</h2>
        <p className="text-slate-500 text-sm">Powered by Groq AI Models</p>
      </div>
    </div>
  );

  const renderInterview = () => {
    const q = questions[currentQuestionIdx] || fallbackQuestions[0];
    const isLastQuestion = currentQuestionIdx === questions.length - 1;

    return (
      <div className="mock-interviews-container mi-interview-layout">
        <div className="mi-interview-top">
          <div>
            <h1 className="mi-interview-title">Mock Interview</h1>
            <p className="mi-interview-subtitle">{selectedDept ? `${selectedDept === 'HR & Behavioral' ? 'Interview' : 'Technical Assessment'}: ${selectedDept}` : 'Technical Assessment'}</p>
          </div>
          <div className="mi-timer-actions">
            <button className="mi-expand-btn"><Maximize2 size={16} /></button>
          </div>
        </div>

        <div className="mi-question-badge">
          QUESTION {currentQuestionIdx + 1} OF {questions.length}
        </div>

        <h2 className="mi-question-text">{q.text}</h2>

        <div className="mi-answer-label">Your Answer</div>

        <div className="mi-editor-container">
          <textarea
            className="mi-editor-textarea"
            placeholder="Type your explanation here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="mi-editor-footer">
            <span className="mi-autosave">Auto-saving...</span>
          </div>
        </div>

        <div className="mi-toolbar">
          <div className="mi-toolbar-actions">
            <button className="mi-toolbar-btn"><b>B</b></button>
            <button className="mi-toolbar-btn"><i>I</i></button>
            <button className="mi-toolbar-btn"><FileText size={16} /></button>
          </div>
          <button className="mi-submit-btn" onClick={handleAnswerSubmit}>
            {isLastQuestion ? 'Submit & Analyze' : 'Save & Next'}
            <Send size={16} />
          </button>
        </div>

        {q.tip && (
          <div className="mi-tip-box">
            <div className="mi-tip-icon-container">
              <Lightbulb size={18} />
            </div>
            <div className="mi-tip-content">
              <h4>Interview Tip</h4>
              <p>{q.tip}</p>
            </div>
          </div>
        )}

        <div className="mi-nav-footer">
          <button
            className="mi-nav-btn"
            onClick={() => {
              setUserAnswers(prev => ({ ...prev, [currentQuestionIdx]: answer }));
              setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1));
              setAnswer(userAnswers[currentQuestionIdx - 1] || '');
            }}
            disabled={currentQuestionIdx === 0}
            style={{ opacity: currentQuestionIdx === 0 ? 0.5 : 1 }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <div className="mi-progress-dots">
            {questions.map((_, i) => (
              <div key={i} className={`mi-dot ${i <= currentQuestionIdx ? 'active' : ''}`}></div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              className="mi-nav-btn"
              onClick={() => {
                setUserAnswers(prev => ({ ...prev, [currentQuestionIdx]: answer }));
                setCurrentQuestionIdx(Math.min(questions.length - 1, currentQuestionIdx + 1));
                setAnswer(userAnswers[currentQuestionIdx + 1] || '');
              }}
              style={{ visibility: isLastQuestion ? 'hidden' : 'visible' }}
            >
              Next <ArrowRight size={16} />
            </button>
            <button className="mi-nav-btn" onClick={handleCompleteInterview}>
              <X size={16} /> End Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => {
    if (!feedbackData) return null;

    return (
      <div className="mock-interviews-container">
        <div className="mi-feedback-header">
          <button className="mi-back-btn" onClick={() => setCurrentView('selection')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="mi-feedback-title">Feedback: {selectedDept} {selectedDept === 'HR & Behavioral' ? '' : 'Technical'}</h1>

          <div className="mi-feedback-controls">
            <div className="mi-search-bar">
              <Search size={16} />
              <input type="text" placeholder="Search insights..." />
            </div>
            <button className="mi-back-btn"><Bell size={18} /></button>
            <button className="mi-back-btn"><User size={18} /></button>
          </div>
        </div>

        <div className="mi-feedback-grid">
          <div className="mi-score-card">
            <div className="mi-card-label">OVERALL PERFORMANCE</div>
            <div className="mi-score-circle-container">
              <div className="mi-score-circle">
                <div className="mi-score-circle-inner">
                  <div className="mi-score-number">{feedbackData.overallScore}<span className="mi-score-total">/10</span></div>
                  <div className="mi-score-text">{feedbackData.scoreText}</div>
                </div>
              </div>
            </div>
            <p className="mi-score-desc">
              {feedbackData.summary}
            </p>
          </div>

          <div className="mi-strengths-card">
            <div className="mi-list-header success">
              <CheckCircle2 size={18} /> Key Strengths
            </div>
            <ul className="mi-list success">
              {feedbackData.strengths?.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="mi-improvements-card">
            <div className="mi-list-header warning">
              <AlertTriangle size={18} /> Improvements
            </div>
            <ul className="mi-list warning">
              {feedbackData.improvements?.map((imp, i) => (
                <li key={i}>{imp}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mi-analysis-card">
          <div className="mi-analysis-header">
            <div>
              <h3 className="mi-analysis-title">Session Analysis</h3>
              <p className="mi-analysis-subtitle">Score breakdown across core competencies</p>
            </div>
            <button className="mi-topic-btn">Topic Performance</button>
          </div>

          {/* Placeholder for chart */}
          <div className="flex-1 flex items-center justify-center mb-4" style={{ height: '240px' }}>
            {feedbackData.competencies ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={feedbackData.competencies}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Performance"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Competency data not available</div>
            )}
          </div>

          <div className="mi-analysis-footer">
            {feedbackData.competencies?.map((c, i) => (
              <span key={i}>{c.subject.toUpperCase()}</span>
            ))}
          </div>
        </div>

        <div className="mi-session-footer">
          <div className="mi-session-meta">
            Completed {selectedDept === 'HR & Behavioral' ? 'Behavioral Interview' : 'Technical Assessment'}
          </div>
          <div className="mi-session-actions">
            <button className="mi-action-btn mi-action-btn-outline" onClick={() => setCurrentView('departmentSelection')}>
              <RefreshCcw size={16} /> Retake Test
            </button>
            <button className="mi-action-btn mi-action-btn-primary" onClick={() => setCurrentView('selection')}>
              Done <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'selection' && renderSelection()}
      {currentView === 'departmentSelection' && renderDepartmentSelection()}
      {currentView === 'loading' && renderLoading()}
      {currentView === 'interview' && renderInterview()}
      {currentView === 'feedback' && renderFeedback()}
    </>
  );
};

export default MockInterviews;
