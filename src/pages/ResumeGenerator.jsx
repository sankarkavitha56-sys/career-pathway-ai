import React, { useState, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   HIREMATE AI — RESUME BUILDER
   Matches paper spec: ATS-compliant, structured PDF export,
   guided form with real-time preview
═══════════════════════════════════════════════════════════════════ */

/* ── Factories ─────────────────────────────────────────────────── */
const uid = () => Date.now() + Math.random();
const mkEdu  = () => ({ id: uid(), degree:'', institution:'', year:'', major:'', cgpa:'' });
const mkExp  = () => ({ id: uid(), title:'', company:'', location:'', start:'', end:'', bullets:[''] });
const mkProj = () => ({ id: uid(), name:'', tech:'', desc:'', link:'' });
const mkCert = () => ({ id: uid(), name:'', issuer:'', year:'' });
const mkSkill= () => ({ id: uid(), name:'' });
const mkLang = () => ({ id: uid(), name:'' });
const mkAch  = () => ({ id: uid(), text:'' });

const INIT = {
  name:'', email:'', phone:'', city:'', linkedin:'', github:'', portfolio:'',
  summary:'',
  education: [mkEdu()],
  experience: [],
  projects:   [mkProj()],
  skills:     [mkSkill(),mkSkill(),mkSkill(),mkSkill()],
  certifications: [],
  achievements:   [],
  languages:      [],
};

const STEPS = [
  { id:'personal',  icon:'👤', label:'Personal',    desc:'Name, contact & links' },
  { id:'summary',   icon:'📝', label:'Summary',     desc:'Professional overview' },
  { id:'education', icon:'🎓', label:'Education',   desc:'Degrees & institutions' },
  { id:'experience',icon:'💼', label:'Experience',  desc:'Jobs & internships' },
  { id:'projects',  icon:'🚀', label:'Projects',    desc:'Work you have built' },
  { id:'skills',    icon:'⚡', label:'Skills',      desc:'Technical expertise' },
  { id:'extras',    icon:'🏆', label:'Extras',      desc:'Certs, achievements, languages' },
];

/* ══════════════════════════════════════════════════════════════════
   RESUME PREVIEW  (ATS two-column style per HireMate paper)
══════════════════════════════════════════════════════════════════ */
function Preview({ d }) {
  const initials = d.name
    ? d.name.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()
    : '??';

  const clean = url => url.replace(/^https?:\/\//,'').replace(/^www\./,'');

  const SectionTitle = ({children}) => (
    <div style={{
      fontSize:8, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase',
      color:'#1a56a0', borderBottom:'1.5px solid #2d7dd2', paddingBottom:3,
      marginBottom:7, marginTop:2
    }}>{children}</div>
  );

  return (
    <div style={{
      background:'white', width:'100%', maxWidth:600,
      fontFamily:'"Arial",sans-serif', fontSize:9.5, color:'#1a1a2e',
      boxShadow:'0 8px 32px rgba(0,0,0,0.15)', borderRadius:6, overflow:'hidden',
      minHeight:800
    }}>
      {/* Header band */}
      <div style={{background:'#1a3a6b', padding:'14px 18px 12px', color:'white'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            width:50, height:50, borderRadius:'50%',
            background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, fontWeight:800, flexShrink:0, letterSpacing:'-0.02em'
          }}>{initials}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4}}>
              {d.name || 'Your Name'}
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px 12px'}}>
              {d.city     && <span style={{fontSize:8.5, opacity:0.85}}>📍 {d.city}</span>}
              {d.phone    && <span style={{fontSize:8.5, opacity:0.85}}>📞 {d.phone}</span>}
              {d.email    && <span style={{fontSize:8.5, opacity:0.85}}>✉ {d.email}</span>}
              {d.linkedin && <span style={{fontSize:8.5, opacity:0.85}}>🔗 {clean(d.linkedin)}</span>}
              {d.github   && <span style={{fontSize:8.5, opacity:0.85}}>⌥ {clean(d.github)}</span>}
              {d.portfolio&& <span style={{fontSize:8.5, opacity:0.85}}>🌐 {clean(d.portfolio)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body: left 60% / right 40% */}
      <div style={{display:'grid', gridTemplateColumns:'60% 40%'}}>

        {/* LEFT */}
        <div style={{padding:'12px 14px 16px', borderRight:'1px solid #dde8f5'}}>

          {d.summary && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Professional Summary</SectionTitle>
              <p style={{fontSize:8.5, lineHeight:1.65, color:'#333', margin:0, overflowWrap:'break-word'}}>{d.summary}</p>
            </div>
          )}

          {d.experience.some(e=>e.title||e.company) && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Work Experience</SectionTitle>
              {d.experience.map(e=>(e.title||e.company)&&(
                <div key={e.id} style={{marginBottom:8}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <span style={{fontSize:9, fontWeight:800, color:'#1a1a2e', flex:1}}>{e.title||'—'}</span>
                    {(e.start||e.end)&&<span style={{fontSize:8, color:'#2d7dd2', whiteSpace:'nowrap', marginLeft:6, fontStyle:'italic'}}>{e.start}{e.end?` – ${e.end}`:''}</span>}
                  </div>
                  {e.company&&<div style={{fontSize:8.5, color:'#555'}}>{e.company}{e.location?`, ${e.location}`:''}</div>}
                  {e.bullets.filter(b=>b.trim()).length>0&&(
                    <ul style={{margin:'3px 0 0 10px', padding:0}}>
                      {e.bullets.filter(b=>b.trim()).map((b,i)=>(
                        <li key={i} style={{fontSize:8.5, lineHeight:1.55, color:'#333', marginBottom:1}}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {d.projects.some(p=>p.name) && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Projects</SectionTitle>
              {d.projects.map(p=>p.name&&(
                <div key={p.id} style={{marginBottom:8}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span style={{fontSize:9, fontWeight:800, color:'#1a1a2e'}}>{p.name}</span>
                    {p.link&&<span style={{fontSize:7.5, color:'#2d7dd2'}}>🔗 link</span>}
                  </div>
                  {p.tech&&<div style={{fontSize:8, color:'#2d7dd2', fontStyle:'italic', marginTop:1}}>{p.tech}</div>}
                  {p.desc&&<div style={{fontSize:8.5, lineHeight:1.55, color:'#444', marginTop:2, overflowWrap:'break-word'}}>{p.desc}</div>}
                </div>
              ))}
            </div>
          )}

          {d.achievements.some(a=>a.text) && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Achievements</SectionTitle>
              <ul style={{margin:'0 0 0 10px', padding:0}}>
                {d.achievements.filter(a=>a.text).map(a=>(
                  <li key={a.id} style={{fontSize:8.5, lineHeight:1.55, color:'#333', marginBottom:2}}>{a.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{padding:'12px 14px 16px', background:'#f5f8fd'}}>

          {d.skills.some(s=>s.name) && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Technical Skills</SectionTitle>
              {d.skills.filter(s=>s.name).map(s=>(
                <div key={s.id} style={{
                  background:'white', border:'1px solid #c8d8ee', borderRadius:4,
                  padding:'3px 8px', fontSize:8.5, color:'#1a3a6b', fontWeight:600,
                  marginBottom:4, overflowWrap:'break-word'
                }}>{s.name}</div>
              ))}
            </div>
          )}

          {d.education.some(e=>e.degree||e.institution) && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Education</SectionTitle>
              {d.education.map(e=>(e.degree||e.institution)&&(
                <div key={e.id} style={{marginBottom:8}}>
                  <div style={{fontSize:9, fontWeight:800, color:'#1a1a2e', overflowWrap:'break-word'}}>
                    {e.degree||'—'}{e.year?` (${e.year})`:''}
                  </div>
                  {e.institution&&<div style={{fontSize:8.5, color:'#444', marginTop:1, overflowWrap:'break-word'}}>{e.institution}</div>}
                  {e.major&&<div style={{fontSize:8, color:'#666', marginTop:1}}>{e.major}</div>}
                  {e.cgpa&&<div style={{fontSize:8, color:'#2d7dd2', marginTop:1}}>CGPA: {e.cgpa}</div>}
                </div>
              ))}
            </div>
          )}

          {d.certifications.some(c=>c.name) && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Certifications</SectionTitle>
              {d.certifications.filter(c=>c.name).map(c=>(
                <div key={c.id} style={{marginBottom:5, fontSize:8.5, lineHeight:1.5, color:'#333'}}>
                  <div style={{fontWeight:700, color:'#1a1a2e'}}>{c.name}</div>
                  {c.issuer&&<div style={{color:'#555'}}>{c.issuer}{c.year?` · ${c.year}`:''}</div>}
                </div>
              ))}
            </div>
          )}

          {d.languages.some(l=>l.name) && (
            <div style={{marginBottom:10}}>
              <SectionTitle>Languages</SectionTitle>
              <div style={{display:'flex', flexWrap:'wrap', gap:3}}>
                {d.languages.filter(l=>l.name).map(l=>(
                  <span key={l.id} style={{
                    background:'#ddeaf8', border:'1px solid #b5cfe8', borderRadius:3,
                    padding:'2px 7px', fontSize:8.5, fontWeight:600, color:'#1a3a6b'
                  }}>{l.name}</span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SMALL REUSABLE FORM PIECES
══════════════════════════════════════════════════════════════════ */
const Inp = ({style,...p}) => (
  <input style={{
    width:'100%', padding:'9px 12px', borderRadius:8,
    border:'1.5px solid #e2e8f0', background:'#f8fafc',
    fontSize:13, color:'#1e293b', outline:'none', boxSizing:'border-box',
    transition:'border-color .15s', ...style
  }} {...p}
  onFocus={e=>{e.target.style.borderColor='#3b82f6'; e.target.style.background='white';}}
  onBlur={e=>{e.target.style.borderColor='#e2e8f0'; e.target.style.background='#f8fafc';}}
  />
);
const Tex = ({style,...p}) => (
  <textarea style={{
    width:'100%', padding:'9px 12px', borderRadius:8,
    border:'1.5px solid #e2e8f0', background:'#f8fafc',
    fontSize:13, color:'#1e293b', outline:'none', resize:'vertical',
    lineHeight:1.6, fontFamily:'inherit', boxSizing:'border-box', ...style
  }} {...p}
  onFocus={e=>{e.target.style.borderColor='#3b82f6'; e.target.style.background='white';}}
  onBlur={e=>{e.target.style.borderColor='#e2e8f0'; e.target.style.background='#f8fafc';}}
  />
);
const Label = ({children, req}) => (
  <div style={{fontSize:12, fontWeight:700, color:'#475569', marginBottom:4}}>
    {children}{req&&<span style={{color:'#ef4444'}}> *</span>}
  </div>
);
const G2 = ({children, style}) => (
  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, ...style}}>{children}</div>
);
const F = ({label, req, span, children}) => (
  <div style={{display:'flex', flexDirection:'column', ...(span===2?{gridColumn:'span 2'}:{})}}>
    {label&&<Label req={req}>{label}</Label>}
    {children}
  </div>
);
const Chip = ({children, color='#3b82f6'}) => (
  <span style={{
    background:color+'18', color:color, border:`1px solid ${color}44`,
    borderRadius:9999, padding:'2px 10px', fontSize:11, fontWeight:700
  }}>{children}</span>
);
const AddBtn = ({children, onClick}) => (
  <button onClick={onClick} style={{
    display:'flex', alignItems:'center', gap:6, fontSize:12.5, fontWeight:700,
    color:'#3b82f6', background:'none', border:'none', cursor:'pointer', padding:'6px 0',
    borderTop:'1px dashed #e2e8f0', width:'100%', marginTop:4
  }}>
    <span style={{fontSize:18, lineHeight:1}}>+</span> {children}
  </button>
);
const RemBtn = ({onClick}) => (
  <button onClick={onClick} style={{
    width:28, height:28, borderRadius:6, background:'#fee2e2', color:'#ef4444',
    border:'none', cursor:'pointer', display:'flex', alignItems:'center',
    justifyContent:'center', flexShrink:0, fontSize:16, lineHeight:1
  }}>×</button>
);
const DynCard = ({children, label, onRemove}) => (
  <div style={{background:'#f8fafc', borderRadius:10, padding:'14px', marginBottom:12, border:'1px solid #e8edf3'}}>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
      <span style={{fontSize:12, fontWeight:800, color:'#334155'}}>{label}</span>
      {onRemove&&<RemBtn onClick={onRemove}/>}
    </div>
    {children}
  </div>
);
const EmptyHint = ({children}) => (
  <div style={{
    fontSize:13, color:'#94a3b8', textAlign:'center', padding:'20px 0',
    border:'1.5px dashed #e2e8f0', borderRadius:10, marginBottom:12, lineHeight:1.6
  }}>{children}</div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function ResumeBuilder() {
  const [form, setForm] = useState(INIT);
  const [step, setStep]  = useState(0);
  const previewRef = useRef(null);

  const sf  = (k,v)   => setForm(f=>({...f,[k]:v}));
  const upd = (k,id,field,v) => setForm(f=>({...f,[k]:f[k].map(x=>x.id===id?{...x,[field]:v}:x)}));
  const add = (k,mk)  => setForm(f=>({...f,[k]:[...f[k],mk()]}));
  const del = (k,id)  => setForm(f=>({...f,[k]:f[k].filter(x=>x.id!==id)}));

  const updBullet=(eid,bi,v)=>setForm(f=>({...f,experience:f.experience.map(e=>e.id===eid?{...e,bullets:e.bullets.map((b,i)=>i===bi?v:b)}:e)}));
  const addBullet=(eid)=>setForm(f=>({...f,experience:f.experience.map(e=>e.id===eid?{...e,bullets:[...e.bullets,'']}:e)}));
  const delBullet=(eid,bi)=>setForm(f=>({...f,experience:f.experience.map(e=>e.id===eid?{...e,bullets:e.bullets.filter((_,i)=>i!==bi)}:e)}));

  const handlePrint = () => {
    const el = previewRef.current; if(!el) return;
    const win = window.open('','_blank');
    win.document.write(`<html><head><title>${form.name||'Resume'}</title><style>body{margin:0;padding:32px;background:white;display:flex;justify-content:center;}*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@media print{body{padding:0;}}</style></head><body onload="setTimeout(()=>{window.print();window.close();},600)">${el.innerHTML}</body></html>`);
    win.document.close();
  };

  const completedFields = [
    form.name, form.email, form.summary,
    form.education.some(e=>e.degree),
    form.skills.some(s=>s.name),
  ].filter(Boolean).length;
  const pct = Math.round((completedFields/5)*100);

  const curStep = STEPS[step];

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%', background:'#f0f4f8', fontFamily:'"Inter","Segoe UI",Arial,sans-serif', overflow:'hidden'}}>

      {/* ── TOP BAR ──────────────────────────────────────────────── */}
      <div style={{
        background:'white', borderBottom:'1px solid #e2e8f0',
        padding:'12px 24px', display:'flex', alignItems:'center',
        justifyContent:'space-between', flexShrink:0, gap:12
      }}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            width:34, height:34, borderRadius:9, background:'#1a3a6b',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
          }}>
            <span style={{color:'white', fontSize:16}}>📄</span>
          </div>
          <div>
            <div style={{fontSize:15, fontWeight:800, color:'#1e293b'}}>Resume Builder</div>
            <div style={{fontSize:11, color:'#64748b'}}>ATS-optimized</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{display:'flex', alignItems:'center', gap:10, flex:1, maxWidth:280}}>
          <div style={{flex:1, height:6, background:'#e2e8f0', borderRadius:999, overflow:'hidden'}}>
            <div style={{width:`${pct}%`, height:'100%', background:'#22c55e', borderRadius:999, transition:'width .3s'}}/>
          </div>
          <span style={{fontSize:12, fontWeight:700, color:'#22c55e', minWidth:36}}>{pct}%</span>
          <span style={{fontSize:11, color:'#64748b'}}>complete</span>
        </div>

        <div style={{display:'flex', gap:8}}>
          <button onClick={handlePrint} style={{
            display:'flex', alignItems:'center', gap:6, background:'#1a3a6b', color:'white',
            border:'none', padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer'
          }}>
            ↓ Download PDF
          </button>
        </div>
      </div>

      {/* ── BODY: stepper + form + preview ───────────────────────── */}
      <div style={{display:'flex', flex:1, overflow:'hidden', gap:0}}>

        {/* LEFT: Step sidebar */}
        <div style={{
          width:200, background:'white', borderRight:'1px solid #e2e8f0',
          padding:'16px 12px', overflowY:'auto', flexShrink:0
        }}>
          <div style={{fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10, paddingLeft:4}}>
            Sections
          </div>
          {STEPS.map((s,i)=>(
            <button key={s.id} onClick={()=>setStep(i)} style={{
              display:'flex', alignItems:'center', gap:10, width:'100%',
              padding:'10px 10px', borderRadius:10, marginBottom:4,
              background: step===i ? '#eff6ff' : 'transparent',
              border: step===i ? '1.5px solid #bfdbfe' : '1.5px solid transparent',
              cursor:'pointer', textAlign:'left', transition:'all .15s'
            }}>
              <span style={{fontSize:16}}>{s.icon}</span>
              <div>
                <div style={{fontSize:12.5, fontWeight: step===i?800:600, color: step===i?'#1d4ed8':'#334155'}}>{s.label}</div>
                <div style={{fontSize:10.5, color:'#94a3b8'}}>{s.desc}</div>
              </div>
            </button>
          ))}

          <div style={{marginTop:16, padding:'12px 10px', background:'#f0fdf4', borderRadius:10, border:'1px solid #bbf7d0'}}>
            <div style={{fontSize:11, fontWeight:700, color:'#16a34a', marginBottom:4}}>💡 ATS Tips</div>
            <div style={{fontSize:10.5, color:'#15803d', lineHeight:1.5}}>
              Use action verbs. Include keywords from job descriptions. Quantify your achievements.
            </div>
          </div>
        </div>

        {/* CENTER: Form */}
        <div style={{flex:1, overflowY:'auto', padding:'20px', minWidth:0}}>
          <div style={{
            background:'white', borderRadius:14, border:'1px solid #e8edf3',
            padding:'22px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', maxWidth:640, margin:'0 auto'
          }}>
            {/* Section header */}
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20, paddingBottom:16, borderBottom:'1px solid #f1f5f9'}}>
              <div style={{
                width:40, height:40, borderRadius:10, background:'#eff6ff',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:20
              }}>{curStep.icon}</div>
              <div>
                <div style={{fontSize:17, fontWeight:800, color:'#1e293b'}}>{curStep.label}</div>
                <div style={{fontSize:12, color:'#64748b'}}>{curStep.desc}</div>
              </div>
              <div style={{marginLeft:'auto'}}>
                <Chip>{step+1} / {STEPS.length}</Chip>
              </div>
            </div>

            {/* ── PERSONAL ──────────────────────────────────── */}
            {step===0&&(
              <div>
                <G2>
                  <F label="Full name" req><Inp placeholder="Santhoosh Kumar" value={form.name} onChange={e=>sf('name',e.target.value)}/></F>
                  <F label="Email address" req><Inp type="email" placeholder="you@email.com" value={form.email} onChange={e=>sf('email',e.target.value)}/></F>
                  <F label="Phone number"><Inp placeholder="+91 98765 43210" value={form.phone} onChange={e=>sf('phone',e.target.value)}/></F>
                  <F label="City / Location"><Inp placeholder="Thanjavur, Tamil Nadu" value={form.city} onChange={e=>sf('city',e.target.value)}/></F>
                  <F label="LinkedIn URL"><Inp placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={e=>sf('linkedin',e.target.value)}/></F>
                  <F label="GitHub URL"><Inp placeholder="github.com/yourname" value={form.github} onChange={e=>sf('github',e.target.value)}/></F>
                  <F label="Portfolio / Website" span={2}><Inp placeholder="yourportfolio.com" value={form.portfolio} onChange={e=>sf('portfolio',e.target.value)}/></F>
                </G2>
              </div>
            )}

            {/* ── SUMMARY ───────────────────────────────────── */}
            {step===1&&(
              <div>
                <div style={{background:'#eff6ff', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#1d4ed8'}}>
                  ✨ Write 2–4 sentences. Mention your role, top skills, and career goal. Make it ATS-friendly.
                </div>
                <F label="Professional summary" req>
                  <Tex rows={6} placeholder="Final year B.Tech (CSE - AI & ML) student at SASTRA University with strong experience in full-stack development and machine learning. Proficient in React, Node.js, Python, and MongoDB. Passionate about building AI-powered products. Seeking a software engineering role to create impactful solutions." value={form.summary} onChange={e=>sf('summary',e.target.value)}/>
                </F>
                <div style={{display:'flex', justifyContent:'space-between', marginTop:6}}>
                  <span style={{fontSize:11, color:'#94a3b8'}}>{form.summary.split(/\s+/).filter(Boolean).length} words</span>
                  <span style={{fontSize:11, color: form.summary.length>=200?'#22c55e':'#94a3b8'}}>
                    {form.summary.length>=200 ? '✓ Good length' : `${200-form.summary.length} more chars recommended`}
                  </span>
                </div>
              </div>
            )}

            {/* ── EDUCATION ─────────────────────────────────── */}
            {step===2&&(
              <div>
                {form.education.map((e,i)=>(
                  <DynCard key={e.id} label={`Education ${i+1}`} onRemove={form.education.length>1?()=>del('education',e.id):null}>
                    <G2>
                      <F label="Degree / Program" req><Inp placeholder="B.Tech Computer Science" value={e.degree} onChange={ev=>upd('education',e.id,'degree',ev.target.value)}/></F>
                      <F label="Institution" req><Inp placeholder="SASTRA University" value={e.institution} onChange={ev=>upd('education',e.id,'institution',ev.target.value)}/></F>
                      <F label="Graduation year"><Inp placeholder="2026" value={e.year} onChange={ev=>upd('education',e.id,'year',ev.target.value)}/></F>
                      <F label="CGPA / Percentage"><Inp placeholder="8.5 / 10" value={e.cgpa} onChange={ev=>upd('education',e.id,'cgpa',ev.target.value)}/></F>
                      <F label="Specialization / Major" span={2}><Inp placeholder="AI & Machine Learning" value={e.major} onChange={ev=>upd('education',e.id,'major',ev.target.value)}/></F>
                    </G2>
                  </DynCard>
                ))}
                <AddBtn onClick={()=>add('education',mkEdu)}>Add another qualification</AddBtn>
              </div>
            )}

            {/* ── EXPERIENCE ────────────────────────────────── */}
            {step===3&&(
              <div>
                {form.experience.length===0&&<EmptyHint>No experience yet? That's okay!<br/>Add internships, part-time, or freelance work.</EmptyHint>}
                {form.experience.map((e,i)=>(
                  <DynCard key={e.id} label={`Experience ${i+1}`} onRemove={()=>del('experience',e.id)}>
                    <G2>
                      <F label="Job title" req><Inp placeholder="Software Engineer Intern" value={e.title} onChange={ev=>upd('experience',e.id,'title',ev.target.value)}/></F>
                      <F label="Company" req><Inp placeholder="Acme Technologies" value={e.company} onChange={ev=>upd('experience',e.id,'company',ev.target.value)}/></F>
                      <F label="Location"><Inp placeholder="Chennai, India" value={e.location} onChange={ev=>upd('experience',e.id,'location',ev.target.value)}/></F>
                      <F label="Start date"><Inp placeholder="Jun 2024" value={e.start} onChange={ev=>upd('experience',e.id,'start',ev.target.value)}/></F>
                      <F label="End date" span={2}><Inp placeholder="Aug 2024 (or Present)" value={e.end} onChange={ev=>upd('experience',e.id,'end',ev.target.value)}/></F>
                    </G2>
                    <div style={{marginTop:10}}>
                      <Label>Key responsibilities & achievements</Label>
                      {e.bullets.map((b,bi)=>(
                        <div key={bi} style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                          <span style={{color:'#94a3b8', fontSize:14}}>•</span>
                          <Inp placeholder="Increased API response time by 40% using Redis caching" value={b} onChange={ev=>updBullet(e.id,bi,ev.target.value)}/>
                          {e.bullets.length>1&&<button onClick={()=>delBullet(e.id,bi)} style={{width:24,height:24,borderRadius:'50%',background:'#fee2e2',color:'#ef4444',border:'none',cursor:'pointer',fontSize:14,flexShrink:0}}>×</button>}
                        </div>
                      ))}
                      <button onClick={()=>addBullet(e.id)} style={{fontSize:12,fontWeight:700,color:'#3b82f6',background:'none',border:'none',cursor:'pointer',padding:'2px 0'}}>+ Add bullet point</button>
                    </div>
                  </DynCard>
                ))}
                <AddBtn onClick={()=>add('experience',mkExp)}>Add experience</AddBtn>
              </div>
            )}

            {/* ── PROJECTS ──────────────────────────────────── */}
            {step===4&&(
              <div>
                {form.projects.map((p,i)=>(
                  <DynCard key={p.id} label={`Project ${i+1}`} onRemove={form.projects.length>0?()=>del('projects',p.id):null}>
                    <G2>
                      <F label="Project name" req><Inp placeholder="HireMate AI" value={p.name} onChange={e=>upd('projects',p.id,'name',e.target.value)}/></F>
                      <F label="Tech stack"><Inp placeholder="React, Node.js, MongoDB, OpenAI" value={p.tech} onChange={e=>upd('projects',p.id,'tech',e.target.value)}/></F>
                      <F label="GitHub / Live link"><Inp placeholder="github.com/you/project" value={p.link} onChange={e=>upd('projects',p.id,'link',e.target.value)}/></F>
                      <F label="Description" span={2}>
                        <Tex rows={3} placeholder="An AI-powered placement preparation platform integrating resume building, job matching, aptitude tests, mock interviews and group discussion simulation..." value={p.desc} onChange={e=>upd('projects',p.id,'desc',e.target.value)}/>
                      </F>
                    </G2>
                  </DynCard>
                ))}
                <AddBtn onClick={()=>add('projects',mkProj)}>Add another project</AddBtn>
              </div>
            )}

            {/* ── SKILLS ────────────────────────────────────── */}
            {step===5&&(
              <div>
                <div style={{background:'#f0fdf4', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#16a34a'}}>
                  ✓ Add specific tools, languages & frameworks. Each skill gets its own card in the resume.
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8}}>
                  {form.skills.map((s,i)=>(
                    <div key={s.id} style={{display:'flex', alignItems:'center', gap:6}}>
                      <Inp placeholder={`Skill ${i+1} (e.g. React.js)`} value={s.name} onChange={e=>upd('skills',s.id,'name',e.target.value)}/>
                      {form.skills.length>1&&<button onClick={()=>del('skills',s.id)} style={{width:28,height:28,borderRadius:6,background:'#fee2e2',color:'#ef4444',border:'none',cursor:'pointer',flexShrink:0,fontSize:16}}>×</button>}
                    </div>
                  ))}
                </div>
                <AddBtn onClick={()=>add('skills',mkSkill)}>Add skill</AddBtn>
                <div style={{marginTop:14, display:'flex', flexWrap:'wrap', gap:6}}>
                  {['Python','React','Node.js','MongoDB','SQL','TensorFlow','Docker','Git','REST APIs','Machine Learning'].map(s=>(
                    <button key={s} onClick={()=>{if(!form.skills.some(x=>x.name===s)) add('skills',()=>({id:uid(),name:s}));}} style={{
                      padding:'4px 12px', borderRadius:9999, border:'1.5px solid #e2e8f0',
                      background:form.skills.some(x=>x.name===s)?'#dbeafe':'white',
                      color:form.skills.some(x=>x.name===s)?'#1d4ed8':'#64748b',
                      fontSize:12, fontWeight:600, cursor:'pointer'
                    }}>{form.skills.some(x=>x.name===s)?'✓ ':''}{s}</button>
                  ))}
                </div>
                <div style={{fontSize:11, color:'#94a3b8', marginTop:6}}>Quick-add common skills</div>
              </div>
            )}

            {/* ── EXTRAS ────────────────────────────────────── */}
            {step===6&&(
              <div>
                {/* Certifications */}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:14, fontWeight:800, color:'#1e293b', marginBottom:10, display:'flex', alignItems:'center', gap:6}}>
                    🏅 Certifications
                    <span style={{fontSize:10, fontWeight:600, background:'#f1f5f9', color:'#94a3b8', padding:'2px 8px', borderRadius:9999}}>optional</span>
                  </div>
                  {form.certifications.length===0&&<EmptyHint>Add AWS, NPTEL, Coursera, Google certifications</EmptyHint>}
                  {form.certifications.map((c,i)=>(
                    <DynCard key={c.id} label={`Certification ${i+1}`} onRemove={()=>del('certifications',c.id)}>
                      <G2>
                        <F label="Certificate name"><Inp placeholder="AWS Cloud Practitioner" value={c.name} onChange={e=>upd('certifications',c.id,'name',e.target.value)}/></F>
                        <F label="Issued by"><Inp placeholder="Amazon Web Services" value={c.issuer} onChange={e=>upd('certifications',c.id,'issuer',e.target.value)}/></F>
                        <F label="Year"><Inp placeholder="2025" value={c.year} onChange={e=>upd('certifications',c.id,'year',e.target.value)}/></F>
                      </G2>
                    </DynCard>
                  ))}
                  <AddBtn onClick={()=>add('certifications',mkCert)}>Add certification</AddBtn>
                </div>

                {/* Achievements */}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:14, fontWeight:800, color:'#1e293b', marginBottom:10}}>🏆 Achievements</div>
                  {form.achievements.length===0&&<EmptyHint>Hackathon wins, scholarships, top ranks, publications</EmptyHint>}
                  {form.achievements.map((a,i)=>(
                    <div key={a.id} style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                      <span style={{color:'#94a3b8'}}>•</span>
                      <Inp placeholder="Won 1st place at Smart India Hackathon 2024" value={a.text} onChange={e=>upd('achievements',a.id,'text',e.target.value)}/>
                      <button onClick={()=>del('achievements',a.id)} style={{width:28,height:28,borderRadius:6,background:'#fee2e2',color:'#ef4444',border:'none',cursor:'pointer',flexShrink:0,fontSize:16}}>×</button>
                    </div>
                  ))}
                  <AddBtn onClick={()=>add('achievements',mkAch)}>Add achievement</AddBtn>
                </div>

                {/* Languages */}
                <div>
                  <div style={{fontSize:14, fontWeight:800, color:'#1e293b', marginBottom:10}}>🗣 Languages</div>
                  {form.languages.length===0&&<EmptyHint>e.g. Tamil (Native), English (Fluent)</EmptyHint>}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:4}}>
                    {form.languages.map((l,i)=>(
                      <div key={l.id} style={{display:'flex', alignItems:'center', gap:6}}>
                        <Inp placeholder="Tamil (Native)" value={l.name} onChange={e=>upd('languages',l.id,'name',e.target.value)}/>
                        <button onClick={()=>del('languages',l.id)} style={{width:28,height:28,borderRadius:6,background:'#fee2e2',color:'#ef4444',border:'none',cursor:'pointer',flexShrink:0,fontSize:16}}>×</button>
                      </div>
                    ))}
                  </div>
                  <AddBtn onClick={()=>add('languages',mkLang)}>Add language</AddBtn>
                </div>
              </div>
            )}

            {/* ── Navigation ────────────────────────────────── */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:24, paddingTop:16, borderTop:'1px solid #f1f5f9'}}>
              <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{
                padding:'9px 20px', borderRadius:8, border:'1.5px solid #e2e8f0',
                background:'white', color: step===0?'#cbd5e1':'#334155',
                fontSize:13, fontWeight:700, cursor: step===0?'default':'pointer'
              }}>← Previous</button>

              <div style={{display:'flex', gap:6}}>
                {STEPS.map((_,i)=>(
                  <button key={i} onClick={()=>setStep(i)} style={{
                    width:8, height:8, borderRadius:'50%', border:'none', cursor:'pointer',
                    background: i===step ? '#1d4ed8' : i<step ? '#22c55e' : '#e2e8f0',
                    padding:0
                  }}/>
                ))}
              </div>

              {step < STEPS.length-1
                ? <button onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))} style={{padding:'9px 20px',borderRadius:8,border:'none',background:'#1d4ed8',color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>Next →</button>
                : <button onClick={handlePrint} style={{padding:'9px 20px',borderRadius:8,border:'none',background:'#16a34a',color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>↓ Generate PDF</button>
              }
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div style={{
          width:340, background:'#dde4ed', borderLeft:'1px solid #c8d3e0',
          display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0
        }}>
          <div style={{
            padding:'10px 16px', background:'#c8d3e0', borderBottom:'1px solid #b8c6d4',
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <span style={{fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em'}}>Live Preview</span>
            <span style={{fontSize:10, color:'#64748b'}}>updates as you type</span>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', justifyContent:'center'}}>
            <div ref={previewRef} style={{width:'100%'}}>
              <Preview d={form}/>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}