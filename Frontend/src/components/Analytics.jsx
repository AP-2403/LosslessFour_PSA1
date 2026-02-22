/* Analytics.jsx — Recharts-powered with working Sort & Region filters */
import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import Sidebar from './Sidebar.jsx'
import Topbar  from './Topbar.jsx'

/* ── Raw data ── */
const RAW_MONTHS = [
  { month:'Sep', matches:18, inquiries:7,  views:140, region:'Asia' },
  { month:'Oct', matches:27, inquiries:11, views:198, region:'Europe' },
  { month:'Nov', matches:34, inquiries:14, views:265, region:'Asia' },
  { month:'Dec', matches:29, inquiries:9,  views:230, region:'Americas' },
  { month:'Jan', matches:42, inquiries:19, views:312, region:'Asia' },
  { month:'Feb', matches:58, inquiries:24, views:410, region:'Asia' },
]

const INDUSTRY_DATA = [
  { name:'Manufacturing', value:34, color:'#4f83ff' },
  { name:'Pharma',        value:22, color:'#34c2bb' },
  { name:'Textiles',      value:17, color:'#a78bfa' },
  { name:'Agri & Food',   value:14, color:'#f59e0b' },
  { name:'Logistics',     value:13, color:'#ec4899' },
]

const REGIONS  = ['All Regions','Asia','Europe','Americas','Middle East','Africa']
const SORT_OPT = ['Most Matches','Most Inquiries','Most Views']

const ACTIVITY = [
  { time:'2h ago',  text:'New match with Sriram Textiles, Coimbatore',   type:'match'   },
  { time:'5h ago',  text:'Inquiry received from Sun Pharma Ltd.',          type:'inquiry' },
  { time:'1d ago',  text:'Profile viewed by 14 companies from Germany',   type:'view'    },
  { time:'1d ago',  text:'Match scored 94% with Asian Paints — pending',  type:'match'   },
  { time:'2d ago',  text:'Inquiry replied — Reliance Trade Hub',           type:'reply'   },
]

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(16,22,100,0.97)', border:'1px solid rgba(52,194,187,0.3)', borderRadius:10, padding:'10px 14px', fontSize:13 }}>
      <div style={{ fontWeight:700, marginBottom:6, color:'#fff' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: <b>{p.value}</b>
        </div>
      ))}
    </div>
  )
}

/* ── KPI card ── */
function KPICard({ label, value, delta, color, icon }) {
  return (
    <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'20px 22px', flex:1, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.8 }}>{label}</span>
        <span style={{ fontSize:22 }}>{icon}</span>
      </div>
      <div style={{ fontSize:32, fontWeight:800, color:'#fff', marginBottom:6 }}>{value}</div>
      <div style={{ fontSize:12, color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
        {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last month
      </div>
    </div>
  )
}

export default function Analytics({ navigate }) {
  const [region, setRegion] = useState('All Regions')
  const [sort,   setSort]   = useState('Most Matches')

  const filtered = useMemo(() => {
    let d = region === 'All Regions' ? RAW_MONTHS : RAW_MONTHS.filter(r => r.region === region)
    if (!d.length) d = RAW_MONTHS   // fallback: show all if no region match
    return d
  }, [region])

  const sorted = useMemo(() => {
    const key = sort === 'Most Matches' ? 'matches' : sort === 'Most Inquiries' ? 'inquiries' : 'views'
    return [...filtered].sort((a,b) => b[key] - a[key])
  }, [filtered, sort])

  const totals = useMemo(() => ({
    matches:   filtered.reduce((s,r) => s + r.matches, 0),
    inquiries: filtered.reduce((s,r) => s + r.inquiries, 0),
    views:     filtered.reduce((s,r) => s + r.views, 0),
  }), [filtered])

  return (
    <div className="page-discover">
      <Sidebar activeItem="analytics" navigate={navigate} />
      <div className="main-area">
        <Topbar placeholder="Search analytics..." userName="Arjun Mehta" userRole="Senior Trade Analyst" avatarText="AM" navigate={navigate} />
        <div className="content">
          {/* Header + Filters */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <h2 style={{ marginBottom:4 }}>Analytics Dashboard</h2>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>Performance metrics for your trade activity</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <select value={region} onChange={e => setRegion(e.target.value)}
                style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:10, color:'#fff', padding:'9px 14px', fontSize:13, outline:'none', cursor:'pointer' }}>
                {REGIONS.map(r => <option key={r} value={r} style={{ background:'#172596' }}>{r}</option>)}
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:10, color:'#fff', padding:'9px 14px', fontSize:13, outline:'none', cursor:'pointer' }}>
                {SORT_OPT.map(s => <option key={s} value={s} style={{ background:'#172596' }}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display:'flex', gap:14, marginBottom:24 }}>
            <KPICard label="Total Matches"   value={totals.matches}   delta={+38} color="#4f83ff" icon="🤝" />
            <KPICard label="Inquiries"        value={totals.inquiries} delta={+26} color="#34c2bb" icon="✉️" />
            <KPICard label="Profile Views"    value={totals.views}     delta={+51} color="#a78bfa" icon="👁️" />
            <KPICard label="Response Rate"    value="84%"              delta={+7}  color="#f59e0b" icon="⚡" />
          </div>

          {/* Main Charts Row */}
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14, marginBottom:14 }}>
            {/* Bar Chart */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'24px' }}>
              <h4 style={{ marginBottom:4, fontSize:14, fontWeight:700 }}>Match &amp; Inquiry Growth</h4>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:18 }}>
                {region !== 'All Regions' ? `Filtered: ${region}` : 'All Regions'} · Sorted by {sort}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sorted} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'rgba(255,255,255,0.5)', fontSize:12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize:12, color:'rgba(255,255,255,0.6)' }} />
                  <Bar dataKey="matches"   name="Matches"   fill="#4f83ff" radius={[5,5,0,0]} />
                  <Bar dataKey="inquiries" name="Inquiries" fill="#34c2bb" radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'24px' }}>
              <h4 style={{ marginBottom:4, fontSize:14, fontWeight:700 }}>Industry Breakdown</h4>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:18 }}>Match distribution by sector</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={INDUSTRY_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={85} paddingAngle={3} dataKey="value">
                    {INDUSTRY_DATA.map(e => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v,n) => [`${v}%`, n]} contentStyle={{ background:'rgba(16,22,100,0.97)', border:'1px solid rgba(52,194,187,0.3)', borderRadius:10, fontSize:13 }} />
                  <Legend wrapperStyle={{ fontSize:12, color:'rgba(255,255,255,0.6)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart — Profile Views Trend */}
          <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'24px', marginBottom:14 }}>
            <h4 style={{ marginBottom:4, fontSize:14, fontWeight:700 }}>Profile Views Trend</h4>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:18 }}>Monthly visibility growth</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'rgba(255,255,255,0.5)', fontSize:12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="views" name="Views" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill:'#a78bfa', r:4 }} activeDot={{ r:6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Feed */}
          <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'22px 24px' }}>
            <h4 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Recent Activity</h4>
            {ACTIVITY.map((a,i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'11px 0', borderBottom: i<ACTIVITY.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background: a.type==='match' ? 'rgba(79,131,255,0.15)' : a.type==='inquiry' ? 'rgba(52,194,187,0.15)' : 'rgba(167,139,250,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:15 }}>
                  {a.type==='match' ? '🤝' : a.type==='inquiry' ? '✉️' : a.type==='view' ? '👁️' : '↩️'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.88)' }}>{a.text}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}