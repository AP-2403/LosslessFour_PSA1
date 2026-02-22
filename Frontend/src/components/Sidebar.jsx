/* Sidebar.jsx — simplified + subtle geometric art decoration */
export default function Sidebar({ activeItem, navigate, matchBadge = 24, inquiryBadge = 3 }) {
  const nav = (page) => navigate && navigate(page)

  return (
    <aside className="sidebar" style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      {/* Logo */}
      <div className="logo" style={{ cursor:'pointer', flexShrink:0 }} onClick={() => nav('discover')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
          <path d="M12 7v4M12 11l-5.5 6M12 11l5.5 6"/>
        </svg>
        NexaTrade
      </div>

      <div className="sidebar-section-label" style={{ flexShrink:0 }}>Main Menu</div>

      {/* Main nav — takes available space */}
      <nav style={{ flex:1, overflow:'hidden' }}>
        <a className={`nav-item${activeItem==='discover'   ? ' active':''}`} onClick={() => nav('discover')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Discover
        </a>
        <a className={`nav-item${activeItem==='matches'    ? ' active':''}`} onClick={() => nav('matches')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Matches
          {matchBadge > 0 && <span className="nav-badge">{matchBadge}</span>}
        </a>
        <a className={`nav-item${activeItem==='inquiries'  ? ' active':''}`} onClick={() => nav('inquiries')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Inquiries
          {inquiryBadge > 0 && <span className="nav-badge">{inquiryBadge}</span>}
        </a>
        <a className={`nav-item${activeItem==='saved'      ? ' active':''}`} onClick={() => nav('saved')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Saved Lists
        </a>
        <a className={`nav-item${activeItem==='analytics'  ? ' active':''}`} onClick={() => nav('analytics')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analytics
        </a>
      </nav>

        {/* Profile / Settings / Help */}
        <div className="nav-bottom" style={{ paddingBottom:10 }}>
          <a className={`nav-item${activeItem==='profile'  ? ' active':''}`} onClick={() => nav('profile')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </a>
          <a className={`nav-item${activeItem==='settings' ? ' active':''}`} onClick={() => nav('settings')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93Z"/></svg>
            Settings
          </a>
          <a className={`nav-item${activeItem==='help'     ? ' active':''}`} onClick={() => nav('help')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help
          </a>
        </div>
      {/* ── Bottom section: nav-bottom + subtle geometric art ── */}
      <div style={{ flexShrink:0, position:'relative' }}>

        {/* Subtle geo art — sits above the bottom buttons */}
        <div style={{ position:'relative', height:82, margin:'6px 10px 2px', borderRadius:12, overflow:'hidden', opacity:0.55 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gridTemplateRows:'repeat(2,1fr)', height:'100%', gap:2, position:'relative', zIndex:1 }}>
            {[
              { bg:'#4f83ff', shape:'arc-br', accent:'#101b80' },
              { bg:'#7c6bef', shape:'full',   accent:'rgba(255,255,255,0.7)' },
              { bg:'#34c2bb', shape:'plain',  accent:null },
              { bg:'#172596', shape:'arc-tl', accent:'#4f83ff' },
              { bg:'#4f83ff', shape:'plain',  accent:null },
              { bg:'#7c6bef', shape:'full',   accent:'rgba(255,255,255,0.6)' },
              { bg:'#34c2bb', shape:'full', accent:'#172596' },
              { bg:'#4f83ff', shape:'arc-bl', accent:'#7c6bef' },
              { bg:'#7c6bef', shape:'plain',  accent:null },
              { bg:'#34c2bb', shape:'arc-tr', accent:'#172596' },
              { bg:'#101b80', shape:'arc-bl', accent:'#7c6bef' },
              { bg:'#4f83ff', shape:'full',   accent:'rgba(255,255,255,0.5)' },
            ].map((c,i) => (
              <div key={i} style={{ background:c.bg, position:'relative', overflow:'hidden', borderRadius:2 }}>
                {c.shape==='arc-br' && <div style={{ position:'absolute', bottom:0, right:0, width:'80%', height:'80%', borderRadius:'80% 0 0 0', background:c.accent }} />}
                {c.shape==='arc-tl' && <div style={{ position:'absolute', top:0, left:0, width:'80%', height:'80%', borderRadius:'0 0 80% 0', background:c.accent }} />}
                {c.shape==='arc-bl' && <div style={{ position:'absolute', bottom:0, left:0, width:'80%', height:'80%', borderRadius:'0 80% 0 0', background:c.accent }} />}
                {c.shape==='arc-tr' && <div style={{ position:'absolute', top:0, right:0, width:'80%', height:'80%', borderRadius:'0 0 0 80%', background:c.accent }} />}
                {c.shape==='full'   && <div style={{ position:'absolute', inset:'15%', borderRadius:'50%', background:c.accent }} />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  )
}