import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, RefreshCcw, Users, Loader2, MessageCircle, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GD_TOPICS = [
  { id: 1, title: 'AI will replace software engineers in 10 years', category: 'Technology', difficulty: 'Hard' },
  { id: 2, title: 'Remote work is more productive than office work', category: 'Workplace', difficulty: 'Medium' },
  { id: 3, title: 'Social media does more harm than good to society', category: 'Society', difficulty: 'Medium' },
  { id: 4, title: 'Electric vehicles are the future of transportation', category: 'Environment', difficulty: 'Easy' },
  { id: 5, title: 'STEM education should be mandatory for all students', category: 'Education', difficulty: 'Medium' },
  { id: 6, title: 'Cryptocurrency will replace traditional banking', category: 'Finance', difficulty: 'Hard' },
  { id: 7, title: 'Data privacy is more important than national security', category: 'Technology', difficulty: 'Hard' },
  { id: 8, title: 'Startups are better career choices than MNCs for freshers', category: 'Career', difficulty: 'Easy' },
];

const AI_PARTICIPANTS = [
  { id: 'alex', name: 'Alex', avatar: 'A', color: '#6366f1', role: 'Devil\'s Advocate' },
  { id: 'priya', name: 'Priya', avatar: 'P', color: '#ec4899', role: 'Supporter' },
  { id: 'rajan', name: 'Rajan', avatar: 'R', color: '#f59e0b', role: 'Analyst' },
];

const diffColor = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

export default function MockGD() {
  const [view, setView] = useState('topics'); // topics | discussion | feedback
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const messagesEndRef = useRef(null);
  const MAX_TURNS = 6;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startGD = async (topic) => {
    setSelectedTopic(topic);
    setMessages([]);
    setTurnCount(0);
    setView('discussion');
    setLoading(true);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are a GD moderator. Return ONLY valid JSON.' },
            { role: 'user', content: `Start a group discussion on: "${topic.title}". Generate an opening statement from moderator and first point from participant Alex (devil\'s advocate). Return JSON: {"moderator": "...", "alex": "..."}` }
          ],
          temperature: 0.8,
          response_format: { type: 'json_object' }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      const initMsgs = [
        { id: Date.now(), sender: 'moderator', name: 'Moderator', text: parsed.moderator, avatar: 'M', color: '#1a3a6b' },
        { id: Date.now() + 1, sender: 'alex', name: 'Alex', text: parsed.alex, avatar: 'A', color: '#6366f1' },
      ];
      setMessages(initMsgs);
    } catch (e) {
      setMessages([
        { id: Date.now(), sender: 'moderator', name: 'Moderator', text: `Welcome! Today's topic is: "${topic.title}". Please share your opening thoughts.`, avatar: 'M', color: '#1a3a6b' }
      ]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;
    const userMsg = { id: Date.now(), sender: 'user', name: 'You', text: userInput, avatar: 'Y', color: '#22c55e' };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setUserInput('');
    setTurnCount(t => t + 1);
    const newTurn = turnCount + 1;

    if (newTurn >= MAX_TURNS) {
      setMessages(prev => [...prev, {
        id: Date.now() + 99, sender: 'moderator', name: 'Moderator',
        text: 'Thank you all for a great discussion! Let me now evaluate the session.',
        avatar: 'M', color: '#1a3a6b'
      }]);
      setTimeout(() => evaluateSession([...newMessages]), 800);
      return;
    }

    setLoading(true);
    try {
      const history = newMessages.map(m => `${m.name}: ${m.text}`).join('\n');
      const nextParticipant = AI_PARTICIPANTS[newTurn % AI_PARTICIPANTS.length];
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are participating in a group discussion. Return ONLY valid JSON.' },
            { role: 'user', content: `Topic: "${selectedTopic.title}"\nConversation so far:\n${history}\n\nYou are ${nextParticipant.name} (${nextParticipant.role}). Respond naturally, ${newTurn % 3 === 0 ? 'counter the user\'s point with a strong argument' : 'build on the discussion with a new perspective'}. Keep it 2-3 sentences. Return JSON: {"response": "..."}` }
          ],
          temperature: 0.85,
          response_format: { type: 'json_object' }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      setMessages(prev => [...prev, {
        id: Date.now(), sender: nextParticipant.id, name: nextParticipant.name,
        text: parsed.response, avatar: nextParticipant.avatar, color: nextParticipant.color
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'priya', name: 'Priya',
        text: 'That\'s an interesting point! I think we should also consider the long-term implications here.',
        avatar: 'P', color: '#ec4899'
      }]);
    }
    setLoading(false);
  };

  const evaluateSession = async (allMessages) => {
    setEvaluating(true);
    const userMessages = allMessages.filter(m => m.sender === 'user').map(m => m.text);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are a GD evaluator. Return ONLY valid JSON.' },
            { role: 'user', content: `Topic: "${selectedTopic.title}"\nUser's contributions:\n${userMessages.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\nEvaluate the user's GD performance. Return JSON:\n{"overallScore": <1-10>, "grade": "<Excellent|Good|Average|Poor>", "summary": "...", "strengths": ["...", "...", "..."], "improvements": ["...", "...", "..."], "metrics": [{"label": "Communication", "score": <0-100>}, {"label": "Argument Quality", "score": <0-100>}, {"label": "Listening & Response", "score": <0-100>}, {"label": "Critical Thinking", "score": <0-100>}, {"label": "Leadership", "score": <0-100>}]}` }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });
      const data = await res.json();
      setFeedback(JSON.parse(data.choices[0].message.content));
    } catch (e) {
      setFeedback({
        overallScore: 6, grade: 'Good',
        summary: 'You participated actively in the discussion and made relevant points.',
        strengths: ['Good communication', 'Relevant points', 'Clear articulation'],
        improvements: ['Add more data-backed arguments', 'Counter others\' points more assertively', 'Introduce new angles'],
        metrics: [
          { label: 'Communication', score: 70 }, { label: 'Argument Quality', score: 60 },
          { label: 'Listening & Response', score: 65 }, { label: 'Critical Thinking', score: 55 }, { label: 'Leadership', score: 50 }
        ]
      });
    }
    setEvaluating(false);
    setView('feedback');
  };

  const endEarly = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) { setView('topics'); return; }
    evaluateSession(messages);
  };

  /* ── TOPIC SELECTION ───────────────────────────────────────────── */
  if (view === 'topics') return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Mock Group Discussion</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Practice GD with AI participants. Get evaluated on communication, argument quality & leadership.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
        {GD_TOPICS.map(topic => (
          <div key={topic.id} onClick={() => startGD(topic)} style={{
            background: 'white', borderRadius: 12, border: '1.5px solid #e2e8f0',
            padding: '1.25rem', cursor: 'pointer', transition: 'all .2s',
            display: 'flex', flexDirection: 'column', gap: 8
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#f1f5f9', padding: '2px 8px', borderRadius: 9999 }}>{topic.category}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: diffColor[topic.difficulty], background: diffColor[topic.difficulty] + '18', padding: '2px 10px', borderRadius: 9999 }}>{topic.difficulty}</span>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>{topic.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              {AI_PARTICIPANTS.map(p => (
                <div key={p.id} style={{ width: 26, height: 26, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>{p.avatar}</div>
              ))}
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>3 AI participants · {MAX_TURNS} turns</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── FEEDBACK ──────────────────────────────────────────────────── */
  if (view === 'feedback') return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      {evaluating ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
          <Loader2 size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Evaluating your GD performance...</div>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      ) : feedback && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <button onClick={() => setView('topics')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>
              <ArrowLeft size={16} /> Back to Topics
            </button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>GD Feedback: {selectedTopic.title.slice(0, 40)}...</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Score */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Overall Score</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#1d4ed8', lineHeight: 1 }}>{feedback.overallScore}<span style={{ fontSize: 18, color: '#94a3b8' }}>/10</span></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', padding: '3px 12px', borderRadius: 9999 }}>{feedback.grade}</div>
            </div>

            {/* Strengths */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 700, color: '#16a34a' }}><CheckCircle2 size={16} /> Strengths</div>
              {feedback.strengths?.map((s, i) => <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 5, paddingLeft: 8, borderLeft: '2px solid #22c55e' }}>{s}</div>)}
            </div>

            {/* Improvements */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 700, color: '#d97706' }}><AlertTriangle size={16} /> Improve</div>
              {feedback.improvements?.map((s, i) => <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 5, paddingLeft: 8, borderLeft: '2px solid #f59e0b' }}>{s}</div>)}
            </div>
          </div>

          {/* Metrics bar chart */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Performance Breakdown</div>
            {feedback.metrics?.map((m, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>{m.score}%</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.score}%`, background: m.score >= 70 ? '#22c55e' : m.score >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 9999, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#eff6ff', borderRadius: 12, padding: '1rem 1.25rem', fontSize: 13, color: '#1d4ed8', marginBottom: '1rem' }}>
            <strong>Summary:</strong> {feedback.summary}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setView('topics'); setFeedback(null); }} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <RefreshCcw size={15} /> Try Another Topic
            </button>
            <button onClick={() => startGD(selectedTopic)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#1d4ed8', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'white' }}>
              Retry Same Topic
            </button>
          </div>
        </>
      )}
    </div>
  );

  /* ── DISCUSSION VIEW ───────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setView('topics')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#475569' }}>
            <ArrowLeft size={14} /> Topics
          </button>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{selectedTopic?.title}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Turn {Math.min(turnCount + 1, MAX_TURNS)} of {MAX_TURNS} · {MAX_TURNS - turnCount} remaining</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: MAX_TURNS }).map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < turnCount ? '#22c55e' : i === turnCount ? '#3b82f6' : '#e2e8f0' }} />
            ))}
          </div>
          <button onClick={endEarly} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}>
            End & Evaluate
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>{msg.avatar}</div>
            <div style={{ maxWidth: '70%' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 3, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>{msg.name}</div>
              <div style={{
                background: msg.sender === 'user' ? '#1d4ed8' : msg.sender === 'moderator' ? '#1e293b' : 'white',
                color: msg.sender === 'user' || msg.sender === 'moderator' ? 'white' : '#1e293b',
                border: msg.sender === 'user' || msg.sender === 'moderator' ? 'none' : '1px solid #e2e8f0',
                borderRadius: msg.sender === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                padding: '10px 14px', fontSize: 13, lineHeight: 1.6
              }}>{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={16} style={{ color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px 12px 12px 4px', padding: '10px 16px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', background: 'white', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
        {turnCount >= MAX_TURNS ? (
          <div style={{ textAlign: 'center', padding: '8px', fontSize: 13, color: '#64748b' }}>Discussion complete. Evaluating...</div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Share your perspective... (Enter to send, Shift+Enter for new line)"
              rows={2}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <button onClick={sendMessage} disabled={!userInput.trim() || loading} style={{
              padding: '0 18px', borderRadius: 10, border: 'none',
              background: userInput.trim() && !loading ? '#1d4ed8' : '#e2e8f0',
              color: userInput.trim() && !loading ? 'white' : '#94a3b8',
              cursor: userInput.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700
            }}>
              <Send size={16} /> Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
