import { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { MatchesMap } from './MapComponent.jsx'
import { api } from '../services/api.js'

/* ── Country → rough lat/lng ── */
const COUNTRY_COORDS = {
  'UK': { lat: 51.5074, lng: -0.1278 },
  'USA': { lat: 37.0902, lng: -95.7129 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'India': { lat: 20.5937, lng: 78.9629 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'China': { lat: 35.8617, lng: 104.1954 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
}
const COORD_DEFAULT = { lat: 20, lng: 0 }

const INDUSTRY_COLOR = {
  'Electronics': { bg: 'rgba(22,197,248,0.15)', fg: '#16c5f8' },
  'Textiles': { bg: 'rgba(139,92,246,0.15)', fg: '#8B5CF6' },
  'Agriculture': { bg: 'rgba(34,197,94,0.15)', fg: '#22C55E' },
  'Pharmaceuticals': { bg: 'rgba(236,72,153,0.15)', fg: '#EC4899' },
  'Automotive': { bg: 'rgba(245,158,11,0.15)', fg: '#F59E0B' },
  'Supply Chain': { bg: 'rgba(22,197,248,0.12)', fg: '#16c5f8' },
  'FMCG': { bg: 'rgba(80,116,255,0.15)', fg: '#5074ff' },
  'IT Software': { bg: 'rgba(80,116,255,0.15)', fg: '#5074ff' },
  'It Software': { bg: 'rgba(80,116,255,0.15)', fg: '#5074ff' },
}
const COLOR_DEFAULT = { bg: 'rgba(80,116,255,0.15)', fg: '#5074ff' }

/* Map API match item → display object */
const apiMatchToDisplay = (item, index) => {
  // buyers is joined from Supabase foreign key
  const buyer = item.buyers ?? {}
  const industry = buyer.industry ?? item.industry ?? 'Trade'
  const country = buyer.country ?? item.country ?? 'Unknown'
  const col = INDUSTRY_COLOR[industry] ?? COLOR_DEFAULT
  const coord = COUNTRY_COORDS[country] ?? COORD_DEFAULT

  // Find buyer_csv_id from the match row (set by ml_bridge)
  const buyerCsvId = item.buyer_csv_id ?? '—'
  const companyName = buyer.company_name && buyer.company_name !== buyerCsvId
    ? buyer.company_name
    : buyerCsvId

  return {
    id: item.id ?? `api-${index}`,
    name: companyName,
    loc: country,
    buyerId: buyerCsvId,
    matchScore: item.ml_match_score ?? item.match_score ?? 0,
    matchLabel: item.match_label ?? 'Matched',
    bestChannel: buyer.preferred_channel ?? item.preferred_channel ?? '',
    online: Math.random() > 0.4,
    emoji: '🏢',
    logoBg: col.bg,
    date: item.created_at
      ? `Matched on ${new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'Recently matched',
    industries: [{ label: industry, bg: col.bg, fg: col.fg }],
    lat: coord.lat,
    lng: coord.lng,
    pinColor: col.fg,
  }
}

/* SVG helpers */
const PinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
const MailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
const CardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>

export default function Matches({ navigate, extraMatches = [], userProfile = {} }) {
  const [apiMatches, setApiMatches] = useState([])
  const [removedIds, setRemovedIds] = useState(new Set())
  const [removing, setRemoving] = useState(new Set())
  const [loadingApi, setLoadingApi] = useState(true)

  // ── Load confirmed matches from backend ──────────────────────────────
  useEffect(() => {
    let cancelled = false
    api.getMatches()
      .then(data => {
        if (cancelled) return
        const items = Array.isArray(data) ? data : []
        setApiMatches(items.map(apiMatchToDisplay))
        setLoadingApi(false)
      })
      .catch(err => {
        if (cancelled) return
        console.warn('Matches API error:', err.message)
        setLoadingApi(false)
      })
    return () => { cancelled = true }
  }, [])

  // Merge: API matches first, then swipe-right matches from Discover, deduped by id
  const seenIds = new Set()
  const allMatches = [
    ...apiMatches,
    ...extraMatches.map(m => ({ ...m, isNew: true })),
  ].filter(m => {
    if (removedIds.has(m.id)) return false
    if (seenIds.has(m.id)) return false
    seenIds.add(m.id)
    return true
  })

  const removeMatch = (id) => {
    setRemoving(prev => new Set(prev).add(id))
    setTimeout(() => {
      setRemovedIds(prev => new Set(prev).add(id))
      setRemoving(prev => { const s = new Set(prev); s.delete(id); return s })
    }, 420)
  }

  const mapPartners = allMatches.map(m => ({
    name: m.name,
    location: m.loc,
    lat: m.lat,
    lng: m.lng,
    color: m.pinColor,
  }))

  return (
    <div className="page-matches">
      <Sidebar
        activeItem="matches"
        navigate={navigate}
        matchBadge={allMatches.length}
      />

      <div className="main-area">
        <Topbar
          placeholder="Search companies, people, industries..."
          userName="Priya Sharma"
          userRole="Business Development Lead"
          avatarText="PS"
          avatarStyle={{ background: 'linear-gradient(135deg,#EC4899,#5074ff)' }}
          navigate={navigate}
        />

        <div className="matches-body">
          {/* LEFT: Match list */}
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
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                Sort by: Newest First
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button className="filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Region: All
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button className="icon-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" />
                  <line x1="4" y1="18" x2="10" y2="18" />
                </svg>
              </button>
            </div>

            <div className="match-list">
              {loadingApi && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Loading matches…
                </div>
              )}

              {!loadingApi && allMatches.length === 0 && (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
                  No matches yet. Swipe right on companies in Discover to match!
                </div>
              )}

              {allMatches.map(m => (
                <div
                  key={m.id}
                  className={`match-item${removing.has(m.id) ? ' removing' : ''}${m.isNew ? ' new-match' : ''}`}
                  style={m.isNew ? { animation: 'slideIn 0.4s ease', borderColor: 'rgba(22,197,248,0.4)' } : {}}
                >
                  <div className="match-logo" style={{ background: m.logoBg, fontSize: 24 }}>
                    <span className="match-emoji">{m.emoji}</span>
                    <div className={`online-dot ${m.online ? 'online' : 'offline'}`} />
                  </div>

                  <div className="match-info">
                    <div className="match-name">
                      {m.name}
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 3 }}>
                        · <PinIcon /> {m.loc}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CardIcon />
                      Buyer ID:{' '}
                      <span style={{ fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace' }}>
                        {m.buyerId}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#22C55E', fontWeight: 700 }}>⚡ {Number(m.matchScore).toFixed(1)}%</span>
                      {m.bestChannel && <><span>·</span><span>{m.bestChannel}</span></>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      {m.industries.map((ind, i) => (
                        <span
                          key={i}
                          className="match-ind-tag"
                          style={{ background: ind.bg, color: ind.fg, border: `1px solid ${ind.fg}33` }}
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>
            </div>
          </div>

          {/* RIGHT: Map panel */}
          <div className="matches-right">
            <h3>Partner Locations</h3>
            <p className="map-sub">Geographic distribution of your matches</p>

            <div style={{ marginBottom: 20 }}>
              <MatchesMap partners={mapPartners} homeCountry={userProfile.country} />
            </div>

            <div className="match-pins">
              {allMatches.map(m => (
                <div key={m.id} className="match-pin">
                  <div className="pin-dot" style={{ background: m.pinColor, boxShadow: `0 0 8px ${m.pinColor}88` }} />
                  <div className="pin-info">
                    <div className="pin-name">{m.name}</div>
                    <div className="pin-loc">📍 {m.loc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="region-legend">
              <div className="leg-title">By Region</div>
              <div className="leg-item"><div className="leg-dot" style={{ background: '#5074ff' }} />South India (2)</div>
              <div className="leg-item"><div className="leg-dot" style={{ background: '#22C55E' }} />West India (3)</div>
              <div className="leg-item"><div className="leg-dot" style={{ background: '#F59E0B' }} />International (0)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}