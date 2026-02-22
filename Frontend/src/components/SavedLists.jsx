/* SavedLists.jsx — with working Create New List modal */
import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar  from './Topbar.jsx'

const INIT_LISTS = [
  { id:1, name:'Priority Pharma Targets', icon:'💊', count:8,  color:'#EC4899', tags:['Pharmaceuticals','Export'], desc:'High-intent pharma players targeting Africa & Middle East.', updated:'20 Feb 2025' },
  { id:2, name:'Steel & Metal Suppliers',  icon:'⚙️', count:12, color:'#4f83ff', tags:['Steel','Manufacturing'],   desc:'Verified steel suppliers with ISO 9001 across Gujarat & Rajasthan.', updated:'18 Feb 2025' },
  { id:3, name:'EU Market Exporters',      icon:'🌍', count:6,  color:'#34c2bb', tags:['Europe','Export'],         desc:'Companies with active EU distribution licences.', updated:'15 Feb 2025' },
  { id:4, name:'Agri-Tech Innovators',     icon:'🌾', count:9,  color:'#f59e0b', tags:['Agriculture','SaaS'],      desc:'Tech-driven agri businesses open to JV arrangements.', updated:'12 Feb 2025' },
  { id:5, name:'Logistics Champions',      icon:'🚚', count:15, color:'#a78bfa', tags:['Logistics','Supply Chain'], desc:'3PL providers with pan-India cold chain capability.', updated:'10 Feb 2025' },
]

const CATEGORY_OPTIONS = ['Pharmaceuticals','Steel & Metals','Technology','Agriculture','Logistics','Manufacturing','Export','Finance','Textiles','Energy']

export default function SavedLists({ navigate }) {
  const [lists,      setLists]      = useState(INIT_LISTS)
  const [showModal,  setShowModal]  = useState(false)
  const [newName,    setNewName]    = useState('')
  const [newDesc,    setNewDesc]    = useState('')
  const [newIcon,    setNewIcon]    = useState('📋')
  const [newTags,    setNewTags]    = useState([])
  const [newColor,   setNewColor]   = useState('#4f83ff')
  const [nameErr,    setNameErr]    = useState(false)

  const ICONS = ['📋','💊','⚙️','🌍','🌾','🚚','🏭','📦','💡','🔬','🏗️','🌱']
  const COLORS = ['#4f83ff','#34c2bb','#EC4899','#f59e0b','#a78bfa','#22C55E','#f8465a']

  const toggleTag = (t) => setNewTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])

  const handleCreate = () => {
    if (!newName.trim()) { setNameErr(true); return }
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
    setLists(prev => [{
      id: Date.now(),
      name:    newName.trim(),
      desc:    newDesc.trim() || 'No description.',
      icon:    newIcon,
      color:   newColor,
      tags:    newTags,
      count:   0,
      updated: dateStr,
    }, ...prev])
    setShowModal(false)
    setNewName(''); setNewDesc(''); setNewIcon('📋'); setNewTags([]); setNewColor('#4f83ff'); setNameErr(false)
  }

  const handleClose = () => {
    setShowModal(false)
    setNewName(''); setNewDesc(''); setNewIcon('📋'); setNewTags([]); setNewColor('#4f83ff'); setNameErr(false)
  }

  return (
    <div className="page-discover">
      <Sidebar activeItem="saved" navigate={navigate} />
      <div className="main-area">
        <Topbar placeholder="Search saved lists..." userName="Arjun Mehta" userRole="Senior Trade Analyst" avatarText="AM" navigate={navigate} />
        <div className="content">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
            <div>
              <h2 style={{ marginBottom:4 }}>Saved Lists</h2>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>{lists.length} curated lists · {lists.reduce((s,l)=>s+l.count,0)} companies total</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create New List
            </button>
          </div>

          {/* List grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {lists.map(l => (
              <div key={l.id} style={{ background:'var(--panel)', border:`1px solid rgba(255,255,255,0.09)`, borderRadius:'var(--radius)', padding:'22px', cursor:'pointer', transition:'all 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${l.color}22` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow='none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:`${l.color}22`, border:`1px solid ${l.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{l.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{l.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{l.count} companies</div>
                  </div>
                </div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.62)', lineHeight:1.6, marginBottom:14 }}>{l.desc}</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                  {l.tags.map(t => <span key={t} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:`${l.color}22`, color:l.color, border:`1px solid ${l.color}44` }}>{t}</span>)}
                </div>
                <div style={{ fontSize:11, color:'var(--text-dim)' }}>Updated {l.updated}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CREATE LIST MODAL ── */}
      {showModal && (
        <div onClick={handleClose} style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(10,14,60,0.7)',
          backdropFilter:'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width:'100%', maxWidth:500,
            background:'rgba(23,37,150,0.97)',
            border:'1px solid rgba(52,194,187,0.30)',
            borderRadius:20, padding:'32px 32px 28px',
            boxShadow:'0 24px 80px rgba(0,0,0,0.5)',
            animation:'slideInUp 0.25s ease',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ fontSize:18, fontWeight:800 }}>Create New List</h3>
              <button onClick={handleClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:18, lineHeight:1 }}>×</button>
            </div>

            {/* Icon picker */}
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:8 }}>Icon</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
              {ICONS.map(ic => (
                <div key={ic} onClick={() => setNewIcon(ic)}
                  style={{ width:38, height:38, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', background: newIcon===ic ? 'rgba(52,194,187,0.2)' : 'rgba(255,255,255,0.07)', border: newIcon===ic ? '1.5px solid var(--accent)' : '1.5px solid transparent', transition:'all 0.15s' }}>
                  {ic}
                </div>
              ))}
            </div>

            {/* Name */}
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>List Name <span style={{ color:'var(--red)' }}>*</span></label>
            <input value={newName} onChange={e => { setNewName(e.target.value); setNameErr(false) }} placeholder="e.g. Top EU Exporters"
              style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${nameErr ? 'var(--red)' : 'rgba(255,255,255,0.14)'}`, borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:14, outline:'none', marginBottom: nameErr ? 4 : 16 }} />
            {nameErr && <div style={{ fontSize:12, color:'var(--red)', marginBottom:12 }}>List name is required.</div>}

            {/* Description */}
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Description</label>
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What's this list for?"
              style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:14, outline:'none', resize:'none', minHeight:72, marginBottom:18 }} />

            {/* Color */}
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:8 }}>Colour</label>
            <div style={{ display:'flex', gap:10, marginBottom:18 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setNewColor(c)}
                  style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border: newColor===c ? '3px solid #fff' : '3px solid transparent', transition:'border 0.15s', boxSizing:'border-box' }} />
              ))}
            </div>

            {/* Tags */}
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:8 }}>Categories</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
              {CATEGORY_OPTIONS.map(t => (
                <span key={t} onClick={() => toggleTag(t)}
                  style={{ fontSize:12, padding:'4px 12px', borderRadius:20, cursor:'pointer', fontWeight:600,
                    background: newTags.includes(t) ? `${newColor}22` : 'rgba(255,255,255,0.07)',
                    color:      newTags.includes(t) ? newColor : 'rgba(255,255,255,0.5)',
                    border:     newTags.includes(t) ? `1px solid ${newColor}66` : '1px solid rgba(255,255,255,0.1)',
                    transition:'all 0.15s' }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={handleCreate}>Create List</button>
              <button className="btn btn-dark"    style={{ flex:1 }} onClick={handleClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}