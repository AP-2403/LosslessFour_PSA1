import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

const INQUIRIES = [
  {
    id: 'INQ-2025-0091',
    company: 'Reliance Trade Hub',
    emoji: '🏢',
    type: 'Received',
    subject: 'Bulk FMCG Distribution Partnership Q1 2025',
    preview: 'We are interested in a long-term distribution arrangement for our FMCG product lines across Southeast Asia...',
    date: '21 Feb 2025',
    status: 'Pending',
    statusColor: '#F59E0B',
  },
  {
    id: 'INQ-2025-0087',
    company: 'Tata Industrial Partners',
    emoji: '🏭',
    type: 'Sent',
    subject: 'OEM Automotive Component Sourcing RFQ',
    preview: 'Following our initial match, we would like to formally request a quote for precision-machined components...',
    date: '19 Feb 2025',
    status: 'Replied',
    statusColor: '#22C55E',
  },
  {
    id: 'INQ-2025-0083',
    company: 'Mahindra Agri Solutions',
    emoji: '🌾',
    type: 'Received',
    subject: 'Cold-Chain Logistics Collaboration — Middle East',
    preview: 'Our team is exploring a joint cold-chain initiative for fresh produce exports from Nashik to the UAE market...',
    date: '15 Feb 2025',
    status: 'Under Review',
    statusColor: '#5074ff',
  },
  {
    id: 'INQ-2025-0071',
    company: 'Infosys B2B Connect',
    emoji: '💻',
    type: 'Sent',
    subject: 'API Integration Partner Program — SaaS',
    preview: 'We would like to discuss onboarding your enterprise platform as an integration partner within our ecosystem...',
    date: '10 Feb 2025',
    status: 'Closed',
    statusColor: 'rgba(255,255,255,0.3)',
  },
  {
    id: 'INQ-2025-0064',
    company: 'Sun Pharma Distribution',
    emoji: '💊',
    type: 'Received',
    subject: 'Generic Drug Export — Sub-Saharan Africa',
    preview: 'Following your company profile review, we are interested in exploring a distribution partnership for generics...',
    date: '5 Feb 2025',
    status: 'Pending',
    statusColor: '#F59E0B',
  },
]

export default function Inquiries({ navigate }) {
  return (
    <div className="page-discover">
      <Sidebar activeItem="inquiries" navigate={navigate} />
      <div className="main-area">
        <Topbar
          placeholder="Search inquiries, subjects..."
          userName="Arjun Mehta"
          userRole="Senior Trade Analyst"
          avatarText="AM"
          navigate={navigate}
        />
        <div className="content">
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ font: '700 22px Space Grotesk, sans-serif', color: 'var(--white)', marginBottom: 4 }}>
              Inquiries
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Manage inbound and outbound trade inquiries.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total', val: '24', icon: '📋', sub: 'All time' },
              { label: 'Pending', val: '8', icon: '⏳', sub: 'Awaiting reply' },
              { label: 'Replied', val: '11', icon: '✅', sub: 'Active threads' },
              { label: 'Closed', val: '5', icon: '🔒', sub: 'Archived' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--panel)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)', borderRadius: 14, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ fontSize: 26 }} className="float-icon-slow">{s.icon}</div>
                <div>
                  <div style={{ font: '800 26px Space Grotesk,sans-serif', color: 'var(--white)' }}>{s.val}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {['All', 'Received', 'Sent', 'Pending', 'Replied'].map(f => (
              <button key={f} style={{
                padding: '7px 16px', borderRadius: 8, border: '1.5px solid',
                borderColor: f === 'All' ? 'var(--accent)' : 'rgba(22,197,248,0.15)',
                background: f === 'All' ? 'rgba(22,197,248,0.12)' : 'rgba(255,255,255,0.04)',
                color: f === 'All' ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.18s',
              }}>{f}</button>
            ))}
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INQUIRIES.map(inq => (
              <div key={inq.id} style={{
                background: 'var(--panel)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)', borderRadius: 14, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'border-color .2s, transform .15s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(22,197,248,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: 32, width: 52, height: 52, background: 'rgba(80,116,255,0.12)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="float-icon-slow">{inq.emoji}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ font: '700 15px Inter, sans-serif', color: 'var(--white)' }}>{inq.company}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                      background: inq.type === 'Received' ? 'rgba(22,197,248,0.12)' : 'rgba(80,116,255,0.15)',
                      color: inq.type === 'Received' ? 'var(--accent)' : '#a5b4fc',
                      border: `1px solid ${inq.type === 'Received' ? 'rgba(22,197,248,0.2)' : 'rgba(80,116,255,0.25)'}`,
                    }}>{inq.type}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)' }}>{inq.id}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--white)', marginBottom: 4 }}>{inq.subject}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inq.preview}</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                    background: `${inq.statusColor}20`, color: inq.statusColor,
                    border: `1px solid ${inq.statusColor}40`,
                  }}>{inq.status}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inq.date}</span>
                  <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>View Thread</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}