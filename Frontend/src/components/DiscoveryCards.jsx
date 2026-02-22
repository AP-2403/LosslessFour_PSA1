import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { DiscoverMap } from './MapComponent.jsx'

const COMPANIES = [
  {
    name: 'Reliance Trade Hub',
    tag: 'Supply Chain & Logistics',
    loc: 'Mumbai, Maharashtra',
    addr: 'BKC, Bandra Kurla Complex, Mumbai – 400051',
    hours: '09:00 – 18:30 (IST)',
    country: 'India',
    emoji: '🏢',
    lat: 19.0760, lng: 72.8777, pinColor: '#16c5f8', logoBg: 'rgba(22,197,248,0.12)',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    imgAlt: 'Reliance industrial hub',
    buyerId: 'BYR-INR-10482',
    verified: true,
    industries: [
      { label: 'Supply Chain', style: 'background:rgba(22,197,248,0.15);color:#16c5f8' },
      { label: 'FMCG', style: 'background:rgba(80,116,255,0.15);color:#5074ff' },
    ],
    about: 'One of India\'s largest integrated supply chain operators, connecting manufacturers across Gujarat and Maharashtra to global buyers. Specializes in FMCG, textiles, and heavy industrial goods distribution.',
    certs: ['ISO 9001', 'ISO 14001', 'AEO'],
    revenue: '₹840Cr', revTrend: '↑ 22% YoY',
    avgOrder: '1,800', orderTrend: '↑ 15%',
    lookingFor: [
      { icon: 'send', label: 'Global Distributors' },
      { icon: 'truck', label: 'Logistics Partners' },
    ],
  },
  {
    name: 'Tata Industrial Partners',
    tag: 'Heavy Manufacturing',
    loc: 'Pune, Maharashtra',
    addr: 'MIDC Industrial Estate, Pimpri-Chinchwad, Pune – 411018',
    hours: '08:00 – 17:30 (IST)',
    country: 'India',
    emoji: '🏭',
    lat: 18.5204, lng: 73.8567, pinColor: '#8B5CF6', logoBg: 'rgba(139,92,246,0.12)',
    img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80',
    imgAlt: 'Tata manufacturing plant',
    buyerId: 'BYR-INR-21304',
    verified: true,
    industries: [
      { label: 'Automotive Mfg', style: 'background:rgba(139,92,246,0.15);color:#8B5CF6' },
      { label: 'Steel & Metals', style: 'background:rgba(22,197,248,0.12);color:#16c5f8' },
    ],
    about: 'A flagship manufacturing unit of the Tata Group consortium operating high-precision automotive component lines and heavy steel fabrication. ISO-certified with 18 production bays.',
    certs: ['ISO 9001', 'IATF 16949', 'ISO 45001'],
    revenue: '₹2,400Cr', revTrend: '↑ 17% YoY',
    avgOrder: '3,200', orderTrend: '↑ 11%',
    lookingFor: [
      { icon: 'send', label: 'OEM Buyers' },
      { icon: 'truck', label: 'Export Partners' },
    ],
  },
  {
    name: 'Mahindra Agri Solutions',
    tag: 'Agriculture & Exports',
    loc: 'Nashik, Maharashtra',
    addr: 'MIDC Satpur, Nashik – 422007, Maharashtra',
    hours: '07:00 – 17:00 (IST)',
    country: 'India',
    emoji: '🌾',
    lat: 20.0059, lng: 73.7898, pinColor: '#22C55E', logoBg: 'rgba(34,197,94,0.12)',
    img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
    imgAlt: 'Maharashtra agricultural fields',
    buyerId: 'BYR-INR-34751',
    verified: true,
    industries: [
      { label: 'Agriculture', style: 'background:rgba(34,197,94,0.15);color:#22C55E' },
      { label: 'Food & Beverage', style: 'background:rgba(245,158,11,0.15);color:#F59E0B' },
    ],
    about: 'Mahindra\'s agricultural export arm handling grapes, onions, pomegranates, and processed foods to Middle East, Europe, and Southeast Asia markets. World-class cold-chain infrastructure.',
    certs: ['APEDA', 'HACCP', 'GlobalG.A.P.'],
    revenue: '₹620Cr', revTrend: '↑ 30% YoY',
    avgOrder: '580', orderTrend: '↑ 18%',
    lookingFor: [
      { icon: 'send', label: 'FMCG Importers' },
      { icon: 'truck', label: 'Cold Chain 3PL' },
    ],
  },
  {
    name: 'Infosys B2B Connect',
    tag: 'IT Software / SaaS',
    loc: 'Bengaluru, Karnataka',
    addr: 'Infosys Campus, Electronics City Phase 1, Bengaluru – 560100',
    hours: '09:30 – 18:30 (IST)',
    country: 'India',
    emoji: '💻',
    lat: 12.9716, lng: 77.5946, pinColor: '#5074ff', logoBg: 'rgba(80,116,255,0.12)',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    imgAlt: 'Infosys tech campus Bengaluru',
    buyerId: 'BYR-INR-47293',
    verified: true,
    industries: [
      { label: 'IT Software', style: 'background:rgba(80,116,255,0.15);color:#5074ff' },
      { label: 'SaaS / B2B', style: 'background:rgba(22,197,248,0.12);color:#16c5f8' },
    ],
    about: 'Enterprise-grade B2B platform division of Infosys enabling cross-border trade digitization. Provides AI-powered matchmaking, KYC verification, and trade finance integration for 5,000+ SMEs.',
    certs: ['SOC 2 Type II', 'ISO 27001', 'NASSCOM'],
    revenue: '$89M', revTrend: '↑ 38% YoY',
    avgOrder: '1,050', orderTrend: '↑ 24%',
    lookingFor: [
      { icon: 'send', label: 'Enterprise Clients' },
      { icon: 'truck', label: 'API Integrators' },
    ],
  },
  {
    name: 'Sun Pharma Distribution',
    tag: 'Pharmaceuticals',
    loc: 'Ahmedabad, Gujarat',
    addr: 'Sun Pharma HQ, Goregaon, Ahmedabad – 380001',
    hours: '08:30 – 17:30 (IST)',
    country: 'India',
    emoji: '💊',
    lat: 23.0225, lng: 72.5714, pinColor: '#EC4899', logoBg: 'rgba(236,72,153,0.12)',
    img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
    imgAlt: 'Pharmaceutical manufacturing',
    buyerId: 'BYR-INR-58906',
    verified: false,
    industries: [
      { label: 'Pharmaceuticals', style: 'background:rgba(236,72,153,0.15);color:#EC4899' },
      { label: 'Medical Devices', style: 'background:rgba(34,197,94,0.15);color:#22C55E' },
    ],
    about: 'India\'s largest pharma company export distribution unit. Covers 100+ countries with a portfolio of 2,000+ generics, specialty drugs, and OTC products. Strict GDP cold-chain certification.',
    certs: ['WHO-GMP', 'FDA Approved', 'ISO 9001', 'GDP'],
    revenue: '$1.2B', revTrend: '↑ 12% YoY',
    avgOrder: '8,400', orderTrend: '↑ 7%',
    lookingFor: [
      { icon: 'send', label: 'Healthcare Importers' },
      { icon: 'truck', label: 'Cold-Chain Logistics' },
    ],
  },
]

const INITIAL_REMAINING = 12

/* ── SVG helpers ── */
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

export default function DiscoveryCards({ navigate, onMatch }) {
  const [cardIndex, setCardIndex] = useState(0)
  const [remaining, setRemaining] = useState(INITIAL_REMAINING)
  const [swipeDir, setSwipeDir] = useState(null)
  const [labelVisible, setLabelVisible] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const company = COMPANIES[cardIndex % COMPANIES.length]

  const toMatchEntry = (c) => {
    const industries = c.industries.map(ind => {
      const obj = cssStrToObj(ind.style)
      return { label: ind.label, bg: obj.background || 'rgba(22,197,248,0.12)', fg: obj.color || '#16c5f8' }
    })
    return {
      id: Date.now() + Math.random(),
      name: c.name,
      loc: c.loc,
      buyerId: c.buyerId,
      online: Math.random() > 0.4,
      emoji: c.emoji,
      logoBg: c.logoBg || 'rgba(80,116,255,0.12)',
      date: `Matched on ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      industries,
      lat: c.lat,
      lng: c.lng,
      pinColor: c.pinColor || '#5074ff',
      isNew: true,
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

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'ArrowLeft') { e.preventDefault(); swipeCard('left') }
      if (e.key === 'ArrowRight') { e.preventDefault(); swipeCard('right') }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); swipeCard('up') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [swipeCard])

  const cardClass = [
    'company-card',
    swipeDir === 'left' ? 'swipe-left' : '',
    swipeDir === 'right' ? 'swipe-right' : '',
    swipeDir === 'up' ? 'swipe-up' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="page-discover">
      <Sidebar activeItem="discover" navigate={navigate} />

      <div className="main-area">
        <Topbar
          placeholder="Search companies, HS codes, regions..."
          userName="Arjun Mehta"
          userRole="Senior Trade Analyst"
          avatarText="AM"
          navigate={navigate}
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
                  <div className="company-name">
                    <span className="float-icon-slow" style={{ marginRight: 8 }}>{company.emoji}</span>
                    {company.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    Buyer ID:{' '}
                    <span style={{ fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {company.buyerId}
                    </span>
                  </div>
                </div>
                <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>···</button>
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
                      <span key={i} style={{ ...cssStrToObj(ind.style), borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, border: '1px solid rgba(22,197,248,0.2)' }}>
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
                  <div className="map-section">
                    <div className="map-section-label">
                      Export Routes <span>Last 12 Months</span>
                    </div>
                    <DiscoverMap countryName={company.country} />
                  </div>

                  <div className="stats-row">
                    <div className="stat-box">
                      <div className="stat-label">Revenue</div>
                      <div className="stat-val">{company.revenue}</div>
                      <div className="stat-sub"><span className="stat-trend">{company.revTrend}</span></div>
                      <div style={{ height: 3, background: 'linear-gradient(90deg,var(--primary),var(--accent))', borderRadius: 99, marginTop: 10, width: '70%' }} />
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Avg Order (Tons)</div>
                      <div className="stat-val">{company.avgOrder}</div>
                      <div className="stat-sub"><span className="stat-trend">{company.orderTrend}</span></div>
                      <div style={{ display: 'flex', gap: 3, marginTop: 10, alignItems: 'flex-end' }}>
                        {[20, 20, 28, 36, 42].map((h, i) => (
                          <div key={i} style={{ height: h, width: 12, background: i >= 3 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: 3, opacity: i === 4 ? 0.85 : 1 }} />
                        ))}
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