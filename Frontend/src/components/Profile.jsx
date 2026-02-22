/* Profile.jsx — full redesign with model-viewer 3D character */
import { useState, useEffect, useRef } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar  from './Topbar.jsx'

const PROFILE = {
  name:     'Arjun Mehta',
  photo:    '/avatar.jpg',
  role:     'Senior Trade Analyst',
  company:  'Mehta Global Exports Pvt. Ltd.',
  location: 'Mumbai, Maharashtra, India',
  email:    'arjun.mehta@nexatrade.in',
  phone:    '+91 98201 45678',
  joined:   'January 2024',
  bio:      'B2B trade specialist with 9+ years across pharmaceuticals, manufacturing, and agri-commodities. Passionate about building cross-border supply chain partnerships through data-driven matchmaking.',
  skills:   ['International Trade','Supply Chain','RFQ Management','Pharma Export','FMCG Sourcing','Cold Chain Logistics'],
  stats:    [
    { label:'Matches',       val:'42',  icon:'🤝', delta:'+12%', color:'#4f83ff' },
    { label:'Inquiries',     val:'26',  icon:'✉️', delta:'+8%',  color:'#34c2bb' },
    { label:'Profile Views', val:'145', icon:'👁️', delta:'+34%', color:'#a78bfa' },
    { label:'Response Rate', val:'84%', icon:'⚡', delta:'+7%',  color:'#f59e0b' },
  ],
  activity: [
    { icon:'🤝', text:'Matched with Wipro Enterprise Solutions',    date:'Feb 21', type:'match' },
    { icon:'✉️', text:'Sent inquiry to Mahindra Agri Solutions',    date:'Feb 20', type:'sent'  },
    { icon:'⭐', text:'Added Godrej to "Priority FMCG" saved list', date:'Feb 19', type:'saved' },
    { icon:'📋', text:'Updated company profile & certifications',   date:'Feb 17', type:'update'},
    { icon:'🤝', text:'New match — Sun Pharma Distribution',        date:'Feb 15', type:'match' },
  ],
  certs: ['ISO 9001 Audited','APEDA Registered','NASSCOM Member'],
}

const ACTIVITY_COLOR = { match:'#4f83ff', sent:'#34c2bb', saved:'#f59e0b', update:'#a78bfa' }

/* ── model-viewer 3D component ── */
function Avatar3D() {
  const mvRef = useRef(null)

  useEffect(() => {
    // model-viewer is a custom web component — mount programmatically for React compat
    const container = mvRef.current
    if (!container) return
    container.innerHTML = ''
    const mv = document.createElement('model-viewer')
    mv.setAttribute('src', '/businessman.glb')
    mv.setAttribute('alt', '3D NexaTrade avatar')
    mv.setAttribute('auto-rotate', '')
    mv.setAttribute('camera-controls', '')
    mv.setAttribute('shadow-intensity', '1')
    mv.setAttribute('exposure', '1')
    mv.setAttribute('ar', '')
    mv.style.cssText = 'width:100%;height:280px;border-radius:16px;--progress-bar-color:transparent;'
    container.appendChild(mv)
    return () => { container.innerHTML = '' }
  }, [])

  return (
    <div ref={mvRef} style={{
      borderRadius:16,
      overflow:'hidden',
      background: 'radial-gradient(circle at 50% 70%, rgba(79,131,255,0.2) 0%, rgba(16,22,100,0.7) 70%)',
      border:'1px solid rgba(52,194,187,0.25)',
    }} />
  )
}

export default function Profile({ navigate }) {
  const [editMode, setEditMode] = useState(false)
  const [bio,      setBio]      = useState(PROFILE.bio)
  const [saved,    setSaved]    = useState(false)

  const handleSave = () => { setSaved(true); setEditMode(false); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="page-discover" style={{ height:'100vh', overflow:'hidden' }}>
      <Sidebar activeItem="profile" navigate={navigate} />
      <div className="main-area" style={{ display:'flex', flexDirection:'column', overflow:'hidden', height:'100vh' }}>
        <Topbar placeholder="Search..." userName={PROFILE.name} userRole={PROFILE.role} avatarText="AM" navigate={navigate} />

        {/* Scrollable content */}
        <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'290px 1fr', gap:18, padding:'18px 24px' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, overflow:'hidden' }}>

            {/* Avatar card */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:18, padding:'20px 18px', textAlign:'center', flexShrink:0 }}>
              <ProfilePhoto src={PROFILE.photo} name={PROFILE.name} />
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:2 }}>{PROFILE.name}</div>
                <div style={{ fontSize:12, color:'var(--accent)', fontWeight:700, marginBottom:8 }}>{PROFILE.role}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:4 }}>
                  📍 {PROFILE.location}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:16 }}>
                  ✉️ {PROFILE.email}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', fontSize:12 }} onClick={() => editMode ? handleSave() : setEditMode(true)}>
                    {saved ? '✓ Saved!' : editMode ? 'Save' : '✏️ Edit Profile'}
                  </button>
                  {editMode && (
                    <button className="btn btn-dark" style={{ flex:1, justifyContent:'center', fontSize:12 }} onClick={() => setEditMode(false)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:14, padding:'16px 18px', flexShrink:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12 }}>Verified Certs</div>
              {PROFILE.certs.map(c => (
                <div key={c} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.18)', borderRadius:8, marginBottom:7 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Member since */}
            <div style={{ background:'linear-gradient(135deg,rgba(79,131,255,0.12),rgba(52,194,187,0.08))', border:'1px solid rgba(52,194,187,0.18)', borderRadius:14, padding:'14px 18px', flexShrink:0, textAlign:'center' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Member since</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--accent)', marginTop:3 }}>{PROFILE.joined}</div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, overflow:'hidden', minHeight:0 }}>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, flexShrink:0 }}>
              {PROFILE.stats.map(s => (
                <div key={s.label} style={{ background:'var(--panel)', border:`1px solid ${s.color}22`, borderRadius:14, padding:'16px 14px', textAlign:'center', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.color, borderRadius:'14px 14px 0 0' }} />
                  <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:26, fontWeight:800, color:'#fff' }}>{s.val}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:s.color, textTransform:'uppercase', letterSpacing:'.06em', marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize:10, color:'#22C55E', marginTop:3 }}>▲ {s.delta}</div>
                </div>
              ))}
            </div>

            {/* Bio */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:14, padding:'20px 22px', flexShrink:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>About</div>
                {editMode && <div style={{ fontSize:11, color:'var(--text-muted)' }}>{bio.length}/400</div>}
              </div>
              {editMode
                ? <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={400} style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(52,194,187,0.25)', borderRadius:10, padding:12, color:'#fff', fontSize:13, outline:'none', lineHeight:1.65, minHeight:80, resize:'none' }} />
                : <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.7 }}>{bio}</p>
              }
            </div>

            {/* Skills + Activity side by side */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, flex:1, minHeight:0, overflow:'hidden' }}>
              {/* Skills */}
              <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:14, padding:'18px', overflow:'hidden' }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Expertise</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {PROFILE.skills.map(s => (
                    <span key={s} style={{ padding:'5px 12px', borderRadius:7, fontSize:12, fontWeight:500, background:'rgba(79,131,255,0.14)', color:'rgba(255,255,255,0.82)', border:'1px solid rgba(79,131,255,0.22)', transition:'all .2s', cursor:'default' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(52,194,187,0.15)'; e.currentTarget.style.borderColor='rgba(52,194,187,0.35)'; e.currentTarget.style.color='var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(79,131,255,0.14)'; e.currentTarget.style.borderColor='rgba(79,131,255,0.22)'; e.currentTarget.style.color='rgba(255,255,255,0.82)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:14, padding:'18px', overflow:'hidden' }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Recent Activity</div>
                {PROFILE.activity.map((a,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<PROFILE.activity.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:`${ACTIVITY_COLOR[a.type]}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{a.icon}</div>
                    <span style={{ flex:1, fontSize:12, color:'rgba(255,255,255,0.75)', lineHeight:1.4 }}>{a.text}</span>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', flexShrink:0 }}>{a.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfilePhoto({ src, name }) {
  const initials = name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
  const [hasImg, setHasImg] = useState(true)
  useEffect(() => { setHasImg(true) }, [src])
  return (
    <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
      {src && hasImg ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasImg(false)}
          style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.06)', boxShadow:'0 6px 18px rgba(0,0,0,0.6)' }}
        />
      ) : (
        <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#4f83ff,#34c2bb)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff', boxShadow:'0 6px 18px rgba(0,0,0,0.6)', border:'2px solid rgba(255,255,255,0.06)' }}>{initials}</div>
      )}
    </div>
  )
}