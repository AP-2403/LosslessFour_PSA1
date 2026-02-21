import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
 import { DiscoverMap } from './MapComponent.jsx'

const COMPANIES = [
  {
    name: 'Logistics Global Solutions',
    tag: 'Logistics & Freight',
    loc: 'Shanghai, China',
    addr: 'No. 1288, Century Avenue, Pudong New Area',
    hours: '09:00 – 18:00 (Local)',
    country: 'China',
    emoji: '🚢',
    lat: 31.2304, lng: 121.4737, pinColor: '#06B6D4', logoBg: '#EEF1FF',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    imgAlt: 'Logistics facility',
    buyerId: 'BYR-20481',
    verified: true,
    industries: [
      { label: 'Logistics & Freight', style: 'background:var(--blue-light);color:var(--blue)' },
      { label: 'Supply Chain', style: 'background:#FEF3C7;color:#B45309' },
    ],
    about: 'Leading provider of integrated logistics services with a focus on cross-border e-commerce solutions. Specialized in handling high-value electronics and time-sensitive shipments across Asia and Europe.',
    certs: ['ISO 9001', 'AEO Certified', 'IATA'],
    revenue: '$42M', revTrend: '↑ 18% YoY',
    avgOrder: '320', orderTrend: '↑ 9%',
    lookingFor: [
      { icon: 'send', label: 'Forwarders Mfg' },
      { icon: 'truck', label: 'Bulk Shipping' },
    ],
  },
  {
    name: 'Apex Manufacturing Co.',
    tag: 'Manufacturing',
    loc: 'Shenzhen, China',
    addr: 'Building 7, Longhua Science & Tech Park',
    hours: '08:00 – 17:30 (Local)',
    country: 'China',
    emoji: '🏭',
    lat: 22.5431, lng: 114.0579, pinColor: '#8B5CF6', logoBg: '#EDE9FE',
    img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80',
    imgAlt: 'Manufacturing floor',
    buyerId: 'BYR-31092',
    verified: true,
    industries: [
      { label: 'Electronics Mfg', style: 'background:#EDE9FE;color:#6D28D9' },
      { label: 'OEM / ODM', style: 'background:#FEF3C7;color:#B45309' },
    ],
    about: 'High-volume contract manufacturer specializing in consumer electronics and industrial components. ISO-certified with 15 production lines and full R&D capability.',
    certs: ['ISO 9001', 'ISO 14001', 'RoHS'],
    revenue: '$128M', revTrend: '↑ 23% YoY',
    avgOrder: '1,200', orderTrend: '↑ 14%',
    lookingFor: [
      { icon: 'send', label: 'Component Buyers' },
      { icon: 'truck', label: 'Global Distributors' },
    ],
  },
  {
    name: 'SwiftFreight Partners',
    tag: 'Air Freight',
    loc: 'Dubai, UAE',
    addr: 'Jebel Ali Free Zone, Block C',
    hours: '07:00 – 20:00 (GST)',
    country: 'United Arab Emirates',
    emoji: '✈️',
    lat: 25.2048, lng: 55.2708, pinColor: '#F59E0B', logoBg: '#FEF3C7',
    img: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80',
    imgAlt: 'Air freight cargo',
    buyerId: 'BYR-44821',
    verified: false,
    industries: [
      { label: 'Air Freight', style: 'background:#EEF1FF;color:var(--blue)' },
      { label: 'Customs Clearance', style: 'background:#DCFCE7;color:#15803D' },
    ],
    about: 'Mid-East hub for express air freight connecting GCC nations to Europe and South Asia. 48-hour delivery guarantee on standard commercial cargo, with specialized pharma cold-chain.',
    certs: ['IATA', 'FIATA', 'TAPA'],
    revenue: '$38M', revTrend: '↑ 11% YoY',
    avgOrder: '85', orderTrend: '↑ 5%',
    lookingFor: [
      { icon: 'send', label: 'Pharma Shippers' },
      { icon: 'truck', label: 'E-commerce Brands' },
    ],
  },
  {
    name: 'EuroTrade Distribution',
    tag: 'Distribution',
    loc: 'Rotterdam, Netherlands',
    addr: 'Maasvlakte 2, Port of Rotterdam',
    hours: '07:30 – 17:00 (CET)',
    country: 'Netherlands',
    emoji: '🏗️',
    lat: 51.9225, lng: 4.4792, pinColor: '#22C55E', logoBg: '#DCFCE7',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    imgAlt: 'Port of Rotterdam',
    buyerId: 'BYR-57903',
    verified: true,
    industries: [
      { label: 'Port Logistics', style: 'background:#FEF3C7;color:#B45309' },
      { label: 'Distribution', style: 'background:var(--blue-light);color:var(--blue)' },
    ],
    about: 'Gateway distributor serving pan-European networks through the Port of Rotterdam. Strong in automotive parts, chemicals, and FMCG with bonded warehouse facilities.',
    certs: ['AEO', 'ISO 9001', 'GDP'],
    revenue: '$220M', revTrend: '↑ 8% YoY',
    avgOrder: '4,500', orderTrend: '↑ 3%',
    lookingFor: [
      { icon: 'send', label: 'Asian Exporters' },
      { icon: 'truck', label: '3PL Partners' },
    ],
  },
  {
    name: 'Pacific Rim Exports',
    tag: 'Export Services',
    loc: 'Tokyo, Japan',
    addr: 'Odaiba, Koto-ku, Tokyo 135-0064',
    hours: '09:00 – 18:00 (JST)',
    country: 'Japan',
    emoji: '🌏',
    lat: 35.6762, lng: 139.6503, pinColor: '#EC4899', logoBg: '#FCE7F3',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    imgAlt: 'Tokyo skyline',
    buyerId: 'BYR-68114',
    verified: true,
    industries: [
      { label: 'Export Mgmt', style: 'background:#EDE9FE;color:#6D28D9' },
      { label: 'Trade Finance', style: 'background:#DCFCE7;color:#15803D' },
    ],
    about: 'Full-service export management company bridging Japanese manufacturers with global buyers. Specializes in high-precision machinery, robotics components, and specialty chemicals.',
    certs: ['ISO 9001', 'JIS', 'JASTPRO'],
    revenue: '$74M', revTrend: '↑ 16% YoY',
    avgOrder: '620', orderTrend: '↑ 12%',
    lookingFor: [
      { icon: 'send', label: 'OEM Buyers' },
      { icon: 'truck', label: 'Engineering Cos.' },
    ],
  },
]

const INITIAL_REMAINING = 12

/* ── small SVG helpers ── */
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

export default function DiscoveryCards({ navigate, onMatch }) {
  const [cardIndex, setCardIndex]       = useState(0)
  const [remaining, setRemaining]       = useState(INITIAL_REMAINING)
  const [swipeDir, setSwipeDir]         = useState(null) // 'left'|'right'|'up'|null
  const [labelVisible, setLabelVisible] = useState(null)
  const [isAnimating, setIsAnimating]   = useState(false)

  const company = COMPANIES[cardIndex % COMPANIES.length]

  /* Convert a Discovery company → Matches card format */
  const toMatchEntry = (c) => {
    // Parse industries from inline-style strings → { label, bg, fg }
    const industries = c.industries.map(ind => {
      const obj = cssStrToObj(ind.style)
      return { label: ind.label, bg: obj.background || '#EEF1FF', fg: obj.color || '#3B5BF5' }
    })
    return {
      id:         Date.now() + Math.random(),
      name:       c.name,
      loc:        c.loc,
      buyerId:    c.buyerId,
      online:     Math.random() > 0.4,
      emoji:      c.emoji,
      logoBg:     c.logoBg || '#EEF1FF',
      date:       `Matched on ${new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}`,
      industries,
      lat:        c.lat,
      lng:        c.lng,
      pinColor:   c.pinColor || '#3B5BF5',
      isNew:      true,
    }
  }

  const swipeCard = useCallback((direction) => {
    if (isAnimating) return
    setIsAnimating(true)
    setSwipeDir(direction)
    setLabelVisible(direction)

    if (direction === 'right' && onMatch) {
      onMatch(toMatchEntry(COMPANIES[cardIndex % COMPANIES.length]))
    }

    setTimeout(() => {
      setCardIndex(i => i + 1)
      setRemaining(r => Math.max(0, r - 1))
      setSwipeDir(null)
      setLabelVisible(null)
      setIsAnimating(false)
    }, 450)
  }, [isAnimating, cardIndex])

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); swipeCard('left') }
      if (e.key === 'ArrowRight') { e.preventDefault(); swipeCard('right') }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); swipeCard('up') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [swipeCard])

  const cardClass = [
    'company-card',
    swipeDir === 'left'  ? 'swipe-left'  : '',
    swipeDir === 'right' ? 'swipe-right' : '',
    swipeDir === 'up'    ? 'swipe-up'    : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="page-discover">
      <Sidebar activeItem="discover" navigate={navigate} variant="discover" />

      <div className="main-area">
        <Topbar
          placeholder="Search companies, HS codes, regions..."
          userName="John Doe"
          userRole="Senior Analyst"
          avatarText="JD"
        />

        <div className="content">
          <div className="discover-header">
            <div>
              <h2>Daily Discovery</h2>
              <p>AI-curated matches based on your sourcing needs.</p>
            </div>
            <span className="remaining-badge">{remaining} Remaining</span>
          </div>

          <div className="card-wrap">
            {/* Swipe labels */}
            <span className="swipe-label pass-label" style={{ opacity: labelVisible === 'left' ? 1 : 0 }}>PASS</span>
            <span className="swipe-label like-label" style={{ opacity: labelVisible === 'right' ? 1 : 0 }}>MATCH</span>
            <span className="swipe-label skip-label" style={{ opacity: labelVisible === 'up' ? 1 : 0 }}>SKIP</span>

            <div className={cardClass} id="discover-card">
              {/* Card Top */}
              <div className="card-top">
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {company.verified && <span className="verified-tag">Verified Supplier</span>}
                    <span className="cat-tag">{company.tag}</span>
                  </div>
                  <div className="company-name">{company.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    Buyer ID:{' '}
                    <span style={{ fontWeight: 600, color: 'var(--navy)', fontFamily: 'monospace' }}>
                      {company.buyerId}
                    </span>
                  </div>
                </div>
                <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 20, lineHeight: 1 }}>···</button>
              </div>

              {/* Card Body */}
              <div className="card-body">
                {/* LEFT */}
                <div className="card-left">
                  <div className="company-img-wrap">
                    <img src={company.img} alt={company.imgAlt} />
                    <div className="photo-badge">
                      <CameraIcon /> 5 Photos
                    </div>
                  </div>

                  <div className="loc-row">
                    <PinIcon />
                    <div>
                      <div className="loc-name">{company.loc}</div>
                      <div className="loc-addr">{company.addr}</div>
                      <div className="loc-hours"><ClockIcon /> {company.hours}</div>
                    </div>
                  </div>

                  <div className="section-label">Industry</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {company.industries.map((ind, i) => (
                      <span key={i} style={{ ...cssStrToObj(ind.style), borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                        {ind.label}
                      </span>
                    ))}
                  </div>

                  <div className="section-label">About Company</div>
                  <p className="about-text">{company.about}</p>
                  <a className="read-more" href="#">Read full profile</a>

                  <div className="section-label">Certifications</div>
                  <div className="cert-tags">
                    {company.certs.map(c => <span key={c} className="cert-tag">{c}</span>)}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="card-right">
                  {/* MAP – country highlight */}
                  <div className="map-section">
                    <div className="map-section-label">
                      Export Routes <span>Last 12 Months</span>
                    </div>
                    <DiscoverMap countryName={company.country} />
                  </div>

                  {/* Stats */}
                  <div className="stats-row">
                    <div className="stat-box">
                      <div className="stat-label">Revenue</div>
                      <div className="stat-val">{company.revenue}</div>
                      <div className="stat-sub"><span className="stat-trend">{company.revTrend}</span></div>
                      <div style={{ height: 4, background: 'var(--blue)', borderRadius: 99, marginTop: 10, width: '70%' }} />
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Avg Order (Tons)</div>
                      <div className="stat-val">{company.avgOrder}</div>
                      <div className="stat-sub"><span className="stat-trend">{company.orderTrend}</span></div>
                      <div style={{ display: 'flex', gap: 3, marginTop: 10, alignItems: 'flex-end' }}>
                        <div style={{ height: 20, width: 14, background: 'var(--gray-200)', borderRadius: 3 }} />
                        <div style={{ height: 20, width: 14, background: 'var(--gray-200)', borderRadius: 3 }} />
                        <div style={{ height: 28, width: 14, background: 'var(--blue-light)', borderRadius: 3 }} />
                        <div style={{ height: 36, width: 14, background: 'var(--blue)', borderRadius: 3 }} />
                        <div style={{ height: 42, width: 14, background: 'var(--blue)', borderRadius: 3, opacity: 0.8 }} />
                      </div>
                    </div>
                  </div>

                  <div className="section-label">Looking For</div>
                  <div className="looking-tags">
                    {company.lookingFor.map((l, i) => (
                      <span key={i} className="looking-tag">
                        {l.icon === 'send' ? <SendIcon /> : <TruckIcon />}
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="action-bar">
                <button className="action-btn pass" onClick={() => swipeCard('left')}>✕</button>
                <button className="action-btn skip" onClick={() => swipeCard('up')}>Skip</button>
                <button className="action-btn like" onClick={() => swipeCard('right')}>✓</button>
              </div>
              <div className="key-hint">← Pass &nbsp;·&nbsp; ↑↓ Skip &nbsp;·&nbsp; → Match</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* utility: convert inline style string to object */
function cssStrToObj(str) {
  return Object.fromEntries(
    str.split(';')
       .filter(Boolean)
       .map(s => {
         const [k, v] = s.split(':').map(x => x.trim())
         const key = k.replace(/-([a-z])/g, (_, l) => l.toUpperCase())
         return [key, v]
       })
  )
}
