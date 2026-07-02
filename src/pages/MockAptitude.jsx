import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, XCircle, RefreshCcw, Trophy, Loader2, AlertTriangle } from 'lucide-react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const DOMAINS = [
  { id: 'quantitative', label: 'Quantitative Aptitude', icon: '🔢', desc: 'Numbers, percentages, ratios, time & work', color: '#6366f1' },
  { id: 'logical', label: 'Logical Reasoning', icon: '🧠', desc: 'Patterns, sequences, puzzles, deduction', color: '#ec4899' },
  { id: 'verbal', label: 'Verbal Ability', icon: '📖', desc: 'Vocabulary, grammar, reading comprehension', color: '#f59e0b' },
  { id: 'mixed', label: 'Mixed (All Topics)', icon: '⚡', desc: 'Combination of all three domains', color: '#22c55e' },
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', time: 30, questions: 10, color: '#22c55e' },
  { id: 'medium', label: 'Medium', time: 45, questions: 10, color: '#f59e0b' },
  { id: 'hard', label: 'Hard', time: 60, questions: 10, color: '#ef4444' },
];

export default function MockAptitude() {
  const [view, setView] = useState('setup'); // setup | loading | test | results
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  const [loadingText, setLoadingText] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (view === 'test' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); submitTest(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view, timeLeft]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timerColor = timeLeft < 60 ? '#ef4444' : timeLeft < 120 ? '#f59e0b' : '#22c55e';

  const startTest = async () => {
    if (!selectedDomain || !selectedDifficulty) return;
    setView('loading');
    setLoadingText(`Generating ${selectedDifficulty.label} ${selectedDomain.label} questions...`);

    const domainPrompt = selectedDomain.id === 'mixed'
      ? 'a mix of quantitative aptitude, logical reasoning, and verbal ability'
      : selectedDomain.label;

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You generate aptitude test questions. Return ONLY valid JSON.' },
            { role: 'user', content: `Generate exactly 10 ${selectedDifficulty.label.toLowerCase()} difficulty multiple-choice aptitude questions on ${domainPrompt}. Each question must have exactly 4 options (A, B, C, D). Return JSON:\n{"questions": [{"id": 1, "question": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correct": "A", "explanation": "..."}]}` }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      const qs = parsed.questions || [];
      setQuestions(qs);
      setAnswers({});
      setCurrentIdx(0);
      setTimeLeft(selectedDifficulty.time * 60);
      setReviewMode(false);
      setView('test');
    } catch (e) {
      // Fallback questions
      setQuestions([
        { id: 1, question: 'If a train travels 60 km in 45 minutes, what is its speed in km/h?', options: { A: '75 km/h', B: '80 km/h', C: '90 km/h', D: '72 km/h' }, correct: 'B', explanation: 'Speed = Distance/Time = 60/(45/60) = 60 × (60/45) = 80 km/h' },
        { id: 2, question: 'What comes next in the series: 2, 6, 12, 20, 30, ?', options: { A: '40', B: '42', C: '44', D: '48' }, correct: 'B', explanation: 'Differences are 4, 6, 8, 10, 12. So next = 30 + 12 = 42' },
        { id: 3, question: 'Choose the correct synonym for "Eloquent":', options: { A: 'Articulate', B: 'Confused', C: 'Silent', D: 'Harsh' }, correct: 'A', explanation: 'Eloquent means fluent and persuasive in speaking — Articulate is the correct synonym.' },
      ]);
      setAnswers({});
      setCurrentIdx(0);
      setTimeLeft(selectedDifficulty.time * 60);
      setReviewMode(false);
      setView('test');
    }
  };

  const submitTest = () => {
    clearInterval(timerRef.current);
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const wrong = Object.keys(answers).length - correct;
    const skipped = questions.length - Object.keys(answers).length;
    const score = Math.round((correct / questions.length) * 100);
    const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Practice';
    setResults({ correct, wrong, skipped, score, grade, total: questions.length });
    setView('results');
  };

  const selectAnswer = (option) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: option }));
  };

  /* ── SETUP ────────────────────────────────────────────────────── */
  if (view === 'setup') return (
    <div style={{ padding: '2rem', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Mock Aptitude Test</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>AI-generated questions with instant scoring and explanations. Simulates real placement tests.</p>
      </div>

      {/* Domain */}
<div style={{ marginBottom: '1.5rem' }}>
  <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>1. Select Domain</div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
    {DOMAINS.map(d => (
      <div key={d.id} onClick={() => setSelectedDomain(d)} style={{
        background: 'white',
        borderRadius: 12,
        border: `2px solid ${selectedDomain?.id === d.id ? d.color : '#e2e8f0'}`,
        padding: '1rem', cursor: 'pointer', transition: 'all .15s',
        display: 'flex', alignItems: 'center', gap: 12,
        background: selectedDomain?.id === d.id ? d.color + '0f' : 'white'   // ← Remove this line
      }}>
        <span style={{ fontSize: 28 }}>{d.icon}</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>{d.label}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{d.desc}</div>
        </div>
      </div>
    ))}
  </div>
</div>
      

      {/* Difficulty */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>2. Select Difficulty</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {DIFFICULTY_LEVELS.map(d => (
            <div key={d.id} onClick={() => setSelectedDifficulty(d)} style={{
              flex: 1, background: selectedDifficulty?.id === d.id ? d.color + '12' : 'white',
              border: `2px solid ${selectedDifficulty?.id === d.id ? d.color : '#e2e8f0'}`,
              borderRadius: 12, padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'all .15s'
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: d.color }}>{d.label}</div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>{d.questions} questions</div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>{d.time} min</div>
            </div>
          ))}
        </div>
      </div>

      {selectedDomain && selectedDifficulty && (
        <div style={{ background: '#eff6ff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: 13, color: '#1d4ed8' }}>
          ✅ <strong>{selectedDomain.label}</strong> · <strong>{selectedDifficulty.label}</strong> · 10 questions · {selectedDifficulty.time} minutes timer
        </div>
      )}

      <button onClick={startTest} disabled={!selectedDomain || !selectedDifficulty} style={{
        width: '100%', padding: '14px', borderRadius: 10, border: 'none',
        background: selectedDomain && selectedDifficulty ? '#1d4ed8' : '#e2e8f0',
        color: selectedDomain && selectedDifficulty ? 'white' : '#94a3b8',
        fontSize: 15, fontWeight: 700, cursor: selectedDomain && selectedDifficulty ? 'pointer' : 'default'
      }}>
        Start Test →
      </button>
    </div>
  );

  /* ── LOADING ──────────────────────────────────────────────────── */
  if (view === 'loading') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Loader2 size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{loadingText}</div>
      <div style={{ fontSize: 13, color: '#64748b' }}>Powered by Groq AI</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── TEST ─────────────────────────────────────────────────────── */
  if (view === 'test') {
    const q = questions[currentIdx];
    const answered = answers[currentIdx];
    const answeredCount = Object.keys(answers).length;

    return (
      <div style={{ padding: '1.5rem', maxWidth: 780, margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
            {selectedDomain?.label} · {selectedDifficulty?.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: timeLeft < 60 ? '#fee2e2' : '#f0fdf4', padding: '6px 14px', borderRadius: 9999 }}>
              <Clock size={15} style={{ color: timerColor }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: timerColor, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
            </div>
            <button onClick={submitTest} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}>
              Submit Test
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {questions.map((_, i) => (
            <div key={i} onClick={() => setCurrentIdx(i)} style={{
              width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: i === currentIdx ? '#1d4ed8' : answers[i] ? '#22c55e' : '#f1f5f9',
              color: i === currentIdx || answers[i] ? 'white' : '#64748b',
              border: i === currentIdx ? '2px solid #1d4ed8' : '2px solid transparent'
            }}>{i + 1}</div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center' }}>
            {answeredCount}/{questions.length} answered
          </div>
        </div>

        {/* Question card */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Question {currentIdx + 1} of {questions.length}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {q?.question}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q && Object.entries(q.options).map(([key, val]) => (
              <div key={key} onClick={() => selectAnswer(key)} style={{
                padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${answered === key ? '#1d4ed8' : '#e2e8f0'}`,
                background: answered === key ? '#eff6ff' : 'white',
                display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s',
              }}
                onMouseEnter={e => { if (answered !== key) e.currentTarget.style.borderColor = '#93c5fd'; }}
                onMouseLeave={e => { if (answered !== key) e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: answered === key ? '#1d4ed8' : '#f1f5f9',
                  color: answered === key ? 'white' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800
                }}>{key}</div>
                <span style={{ fontSize: 13.5, color: '#1e293b', fontWeight: answered === key ? 600 : 400 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} style={{
            padding: '9px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0',
            background: 'white', fontSize: 13, fontWeight: 700, cursor: currentIdx > 0 ? 'pointer' : 'default',
            color: currentIdx > 0 ? '#334155' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <ArrowLeft size={15} /> Previous
          </button>
          {currentIdx < questions.length - 1
            ? <button onClick={() => setCurrentIdx(i => i + 1)} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#1d4ed8', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Next <ArrowRight size={15} />
            </button>
            : <button onClick={submitTest} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#22c55e', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Submit & See Results
            </button>
          }
        </div>
      </div>
    );
  }

  /* ── RESULTS ──────────────────────────────────────────────────── */
  if (view === 'results' && results) {
    const gradeColor = results.score >= 80 ? '#22c55e' : results.score >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div style={{ padding: '2rem', maxWidth: 780, margin: '0 auto' }}>
        {/* Score header */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Test Complete · {selectedDomain?.label}</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{results.score}%</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: gradeColor, marginTop: 6 }}>{results.grade}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.25rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>{results.correct}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Correct</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{results.wrong}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Wrong</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#94a3b8' }}>{results.skipped}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Skipped</div>
            </div>
          </div>
        </div>

        {/* Review answers toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
          <button onClick={() => setReviewMode(r => !r)} style={{
            flex: 1, padding: '10px', borderRadius: 8,
            border: `2px solid ${reviewMode ? '#1d4ed8' : '#e2e8f0'}`,
            background: reviewMode ? '#eff6ff' : 'white',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: reviewMode ? '#1d4ed8' : '#334155'
          }}>
            {reviewMode ? '▲ Hide Answers' : '▼ Review All Answers & Explanations'}
          </button>
          <button onClick={() => { setView('setup'); setResults(null); setSelectedDomain(null); setSelectedDifficulty(null); }} style={{
            padding: '10px 20px', borderRadius: 8, border: 'none', background: '#1d4ed8', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <RefreshCcw size={14} /> Retake
          </button>
        </div>

        {/* Answer review */}
        {reviewMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.correct;
              return (
                <div key={i} style={{ background: 'white', borderRadius: 12, border: `2px solid ${!userAns ? '#e2e8f0' : isCorrect ? '#86efac' : '#fca5a5'}`, padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Q{i + 1}. {q.question}</div>
                    {!userAns ? <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 9999 }}>Skipped</span>
                      : isCorrect ? <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                        : <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>
                    {Object.entries(q.options).map(([k, v]) => (
                      <span key={k} style={{
                        display: 'inline-block', marginRight: 10, padding: '2px 10px', borderRadius: 6,
                        background: k === q.correct ? '#dcfce7' : k === userAns && !isCorrect ? '#fee2e2' : '#f8fafc',
                        color: k === q.correct ? '#16a34a' : k === userAns && !isCorrect ? '#dc2626' : '#475569',
                        fontWeight: k === q.correct || k === userAns ? 700 : 400, fontSize: 12
                      }}>{k}: {v}</span>
                    ))}
                  </div>
                  {q.explanation && (
                    <div style={{ fontSize: 12, color: '#1d4ed8', background: '#eff6ff', borderRadius: 8, padding: '6px 10px' }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}
