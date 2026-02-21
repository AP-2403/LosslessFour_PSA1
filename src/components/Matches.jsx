import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { MatchesMap } from './MapComponent.jsx'

const INITIAL_MATCHES = [
  {
    id: 1,
    name: 'TechFlow Solutions',
    loc: 'San Francisco, CA',
    buyerId: 'BYR-10291',
    online: true,
    emoji: '📦',
    logoBg: '#EEF1FF',
    date: 'Matched on Oct 24, 2023',
    industries: [
      { label: 'IT Software',  bg: '#EEF1FF', fg: '#3B5BF5' },
      { label: 'FinTech',      bg: '#FEF3C7', fg: '#B45309' },
      { label: 'SaaS',         bg: '#DCFCE7', fg: '#15803D' },
    ],
    lat: 37.7749, lng: -122.4194, pinColor: '#3B5BF5',
  },
  {
    id: 2,
    name: 'GreenLeaf Logistics',
    loc: 'Austin, TX',
    buyerId: 'BYR-30847',
    online: false,
    emoji: '🌿',
    logoBg: '#DCFCE7',
    date: 'Matched on Oct 22, 2023',
    industries: [
      { label: 'Supply Chain', bg: '#DCFCE7', fg: '#15803D' },
      { label: 'AgriTech',     bg: '#FEF3C7', fg: '#B45309' },
    ],
    lat: 30.2672, lng: -97.7431, pinColor: '#22C55E',
  },
  {
    id: 3,
    name: 'Quantum Dynamics',
    loc: 'London, UK',
    buyerId: 'BYR-55102',
    online: true,
    emoji: '🤖',
    logoBg: '#FEF3C7',
    date: 'Matched on Oct 20, 2023',
    industries: [
      { label: 'Machinery',     bg: '#FEF3C7', fg: '#B45309' },
      { label: 'Engineering',   bg: '#EDE9FE', fg: '#6D28D9' },
      { label: 'AI & Robotics', bg: '#EEF1FF', fg: '#3B5BF5' },
    ],
    lat: 51.5074, lng: -0.1278, pinColor: '#F59E0B',
  },
  {
    id: 4,
    name: 'Vitality Health Systems',
    loc: 'Boston, MA',
    buyerId: 'BYR-77430',
    online: false,
    emoji: '💊',
    logoBg: '#FCE7F3',
    date: 'Matched on Oct 19, 2023',
    industries: [
      { label: 'Medical Devices', bg: '#FCE7F3', fg: '#BE185D' },
      { label: 'BioTech',         bg: '#DCFCE7', fg: '#15803D' },
    ],
    lat: 42.3601, lng: -71.0589, pinColor: '#EF4444',
  },
  {
    id: 5,
    name: 'Nova Retail Group',
    loc: 'New York, NY',
    buyerId: 'BYR-62019',
    online: true,
    emoji: '🚀',
    logoBg: '#EDE9FE',
    date: 'Matched on Oct 18, 2023',
    industries: [
      { label: 'E-commerce',  bg: '#EDE9FE', fg: '#6D28D9' },
      { label: 'Retail Tech', bg: '#FEE2E2', fg: '#B91C1C' },
      { label: 'Textiles',    bg: '#FEF3C7', fg: '#B45309' },
    ],
    lat: 40.7128, lng: -74.006, pinColor: '#8B5CF6',
  },
]

const PIN_COLORS = ['#3B5BF5', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
const LOGO_BGS   = ['#EEF1FF', '#DCFCE7', '#FEF3C7', '#FCE7F3', '#EDE9FE']
const IND_COLORS = [
  { bg: '#EEF1FF', fg: '#3B5BF5' }, { bg: '#DCFCE7', fg: '#15803D' },
  { bg: '#FEF3C7', fg: '#B45309' }, { bg: '#EDE9FE', fg: '#6D28D9' },
  { bg: '#FEE2E2', fg: '#B91C1C' }, { bg: '#FCE7F3', fg: '#BE185D' },
]

let nextId = 100

/* ── SVG helpers ── */
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const CardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)

export default function Matches({ navigate, extraMatches = [] }) {
  const [removedIds, setRemovedIds] = useState(new Set())
  const [removing, setRemoving]     = useState(new Set())

  // Displayed list = new matches from Discovery (prepended) + initial matches, minus removed
  const allMatches = [
    ...extraMatches.map(m => ({ ...m, isNew: true })),
    ...INITIAL_MATCHES,
  ].filter(m => !removedIds.has(m.id))

  const removeMatch = (id) => {
    setRemoving(prev => new Set(prev).add(id))
    setTimeout(() => {
      setRemovedIds(prev => new Set(prev).add(id))
      setRemoving(prev => { const s = new Set(prev); s.delete(id); return s })
    }, 420)
  }

  // Pass lat, lng, and pinColor (as `color`) to MatchesMap
  // MatchesMap uses these to:
  //   1. Point-in-polygon detect the country and highlight it with `color`
  //   2. Draw a dotted trade curve from Home → [lat, lng] in `color`
  const mapPartners = allMatches.map(m => ({
    name:     m.name,
    location: m.loc,
    lat:      m.lat,
    lng:      m.lng,
    color:    m.pinColor,   // ← drives both country fill + curve color
  }))

  return (
    <div className="page-matches">
      <Sidebar
        activeItem="matches"
        navigate={navigate}
        variant="matches"
        matchBadge={allMatches.length}
      />

      <div className="main-area">
        <Topbar
          placeholder="Search companies, people, industries..."
          userName="Alex Johnson"
          userRole="Business Analyst"
          avatarText="AJ"
          avatarStyle={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}
        />

        <div className="matches-body">
          {/* ── LEFT: Match list ── */}
          <div className="matches-left">
            <div className="matches-header">
              <div>
                <h2>Your Matches</h2>
                <p>Manage and connect with your potential B2B partners tailored to your profile.</p>
              </div>
            </div>

            {/* Filter row */}
            <div className="filter-row">
              <button className="filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Sort by: Newest First
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <button className="filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Region: All
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <button className="icon-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/>
                  <line x1="4" y1="18" x2="10" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="match-list">
              {allMatches.map(m => (
                <div
                  key={m.id}
                  className={`match-item${removing.has(m.id) ? ' removing' : ''}${m.isNew ? ' new-match' : ''}`}
                  style={m.isNew ? { animation: 'slideIn 0.4s ease', border: '2px solid var(--blue)' } : {}}
                >
                  <div className="match-logo" style={{ background: m.logoBg, fontSize: 24 }}>
                    {m.emoji}
                    <div className={`online-dot ${m.online ? 'online' : 'offline'}`} />
                  </div>

                  <div className="match-info">
                    <div className="match-name">
                      {m.name}
                      <span style={{ color: 'var(--gray-400)', fontSize: 12, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 3 }}>
                        · <PinIcon /> {m.loc}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CardIcon />
                      Buyer ID:{' '}
                      <span style={{ fontWeight: 600, color: 'var(--navy)', fontFamily: 'monospace' }}>
                        {m.buyerId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      {m.industries.map((ind, i) => (
                        <span
                          key={i}
                          className="match-ind-tag"
                          style={{ background: ind.bg, color: ind.fg }}
                        >
                          {ind.label}
                        </span>
                      ))}
                    </div>
                    <div className="match-date">{m.date}</div>
                  </div>

                  <div className="match-actions">
                    <button className="msg-btn">
                      <MailIcon /> Message
                    </button>
                    <button
                      className="del-btn"
                      onClick={() => removeMatch(m.id)}
                      title="Remove match"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="load-more">
              <a href="#">
                Load more matches
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ── RIGHT: Map panel ── */}
          <div className="matches-right">
            <h3>Partner Locations</h3>
            <p className="map-sub">Geographic distribution of your matches</p>

            {/* Trade route map */}
            <div style={{ marginBottom: 20 }}>
              <MatchesMap partners={mapPartners} />
            </div>

            {/* Partner list */}
            <div className="match-pins">
              {allMatches.map(m => (
                <div key={m.id} className="match-pin">
                  <div className="pin-dot" style={{ background: m.pinColor }} />
                  <div className="pin-info">
                    <div className="pin-name">{m.name}</div>
                    <div className="pin-loc">📍 {m.loc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="region-legend">
              <div className="leg-title">By Region</div>
              <div className="leg-item"><div className="leg-dot" style={{ background: '#3B5BF5' }} />North America (4)</div>
              <div className="leg-item"><div className="leg-dot" style={{ background: '#F59E0B' }} />Europe (1)</div>
              <div className="leg-item"><div className="leg-dot" style={{ background: '#22C55E' }} />Asia Pacific (0)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}