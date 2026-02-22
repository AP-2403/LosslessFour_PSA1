import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { api } from '../services/api.js'

/* ══════════════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════════════ */
const INDUSTRIES = [
  'Agriculture', 'Aerospace', 'Automotive', 'BioTech', 'Chemicals', 'Construction',
  'Consumer Goods', 'Defense', 'E-commerce', 'Education', 'Energy', 'Engineering',
  'FinTech', 'Food & Beverage', 'Healthcare', 'IT Software', 'Logistics',
  'Machinery', 'Manufacturing', 'Maritime', 'Medical Devices', 'Mining',
  'Pharmaceuticals', 'Retail', 'Robotics & AI', 'SaaS', 'Solar & Renewables',
  'Steel & Metals', 'Supply Chain', 'Telecommunications', 'Textiles',
  'Transportation', 'Waste Management',
]

const COUNTRIES = [
  'Afghanistan', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium',
  'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Denmark', 'Egypt',
  'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Hungary',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Jordan', 'Kenya', 'South Korea', 'Malaysia', 'Mexico', 'Morocco',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore',
  'South Africa', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan',
  'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States of America', 'Vietnam', 'Zimbabwe',
]

const REVENUE_RANGES = [
  'Under $100K', '$100K – $500K', '$500K – $1M',
  '$1M – $5M', '$5M – $25M', '$25M – $100M', '$100M+',
]

const TEAM_SIZES = [
  '1 – 10', '11 – 50', '51 – 200', '201 – 500', '501 – 1,000', '1,000+',
]

const CERT_OPTIONS = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'CE Mark', 'FDA Approved',
  'GMP', 'HACCP', 'REACH', 'RoHS', 'SA8000', 'SMETA', 'SOC 2',
]

const RESPONSE_SPEEDS = ['Slow (> 5 days)', 'Moderate (2 – 5 days)', 'Fast (< 48 hours)']

const REVENUE_MAP = {
  'Under $100K': 50000,
  '$100K – $500K': 300000,
  '$500K – $1M': 750000,
  '$1M – $5M': 3000000,
  '$5M – $25M': 15000000,
  '$25M – $100M': 62500000,
  '$100M+': 150000000,
}

const TEAM_SIZE_MAP = {
  '1 – 10': '1-10',
  '11 – 50': '11-50',
  '51 – 200': '51-200',
  '201 – 500': '201-500',
  '501 – 1,000': '501-1000',
  '1,000+': '1000+',
}

/* ══════════════════════════════════════════════════════════════
   DROPDOWN STYLES
══════════════════════════════════════════════════════════════ */
const dropdownMenuStyle = {
  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999,
  background: '#0e1260',
  border: '1.5px solid rgba(22,197,248,0.25)',
  borderRadius: 11,
  boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(22,197,248,0.08)',
  maxHeight: 200, overflowY: 'auto',
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE: SEARCHABLE SINGLE-SELECT DROPDOWN
══════════════════════════════════════════════════════════════ */
function SearchDropdown({ options, value, onChange, placeholder, icon, hasError, onFocus }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  const select = (opt) => {
    onChange(opt)
    setQuery('')
    setOpen(false)
    if (onFocus) onFocus()
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className={`fi${hasError ? ' fi-error' : ''}`}>
        {icon}
        <input
          type="text"
          placeholder={value || placeholder}
          value={open ? query : value}
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          style={{ color: value && !open ? 'var(--white)' : undefined }}
          readOnly={false}
          autoComplete="off"
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none', color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {open && filtered.length > 0 && (
        <div style={dropdownMenuStyle}>
          {filtered.map(opt => (
            <div
              key={opt}
              onMouseDown={() => select(opt)}
              style={{
                padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                color: opt === value ? 'var(--accent)' : 'rgba(255,255,255,0.8)',
                fontWeight: opt === value ? 700 : 400,
                background: opt === value ? 'rgba(22,197,248,0.1)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(80,116,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = opt === value ? 'rgba(22,197,248,0.1)' : 'transparent'}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE: MULTI-SELECT SEARCHABLE DROPDOWN
══════════════════════════════════════════════════════════════ */
function MultiDropdown({ options, value = [], onChange, placeholder, icon, hasError, onFocus }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o =>
    o.toLowerCase().includes(query.toLowerCase()) && !value.includes(o)
  )

  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]
    onChange(next)
    if (onFocus) onFocus()
  }

  const remove = (opt, e) => { e.stopPropagation(); onChange(value.filter(v => v !== opt)) }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div
        className={`fi${hasError ? ' fi-error' : ''}`}
        style={{ flexWrap: 'wrap', minHeight: 44, height: 'auto', gap: 4, paddingTop: value.length ? 6 : undefined, paddingBottom: value.length ? 6 : undefined, cursor: 'text', alignItems: 'center' }}
        onClick={() => { setOpen(true) }}
      >
        {icon}
        {value.map(v => (
          <span key={v} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(22,197,248,0.15)', color: 'var(--accent)',
            border: '1px solid rgba(22,197,248,0.3)',
            borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {v}
            <span onMouseDown={e => remove(v, e)} style={{ cursor: 'pointer', lineHeight: 1, marginLeft: 2, opacity: 0.7 }}>✕</span>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          placeholder={value.length ? '' : placeholder}
          style={{ flex: 1, minWidth: 80, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--white)', fontFamily: 'inherit' }}
          autoComplete="off"
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none', color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {open && (
        <div style={dropdownMenuStyle}>
          {value.map(v => (
            <div key={v} onMouseDown={() => toggle(v)} style={{
              padding: '9px 14px', fontSize: 13, cursor: 'pointer',
              color: 'var(--accent)', fontWeight: 700,
              background: 'rgba(22,197,248,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              {v} <span style={{ fontSize: 11 }}>✓</span>
            </div>
          ))}
          {filtered.length > 0
            ? filtered.map(opt => (
              <div key={opt} onMouseDown={() => toggle(opt)} style={{
                padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                color: 'rgba(255,255,255,0.8)', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(80,116,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {opt}
              </div>
            ))
            : <div style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-muted)' }}>No results</div>
          }
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE: YES / NO TOGGLE
══════════════════════════════════════════════════════════════ */
function YesNoToggle({ value, onChange, hasError }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
      {['Yes', 'No'].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => { onChange(opt) }}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid',
            borderColor: value === opt ? 'var(--accent)' : 'rgba(22,197,248,0.15)',
            background: value === opt ? 'rgba(22,197,248,0.12)' : 'rgba(255,255,255,0.04)',
            color: value === opt ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: value === opt ? 700 : 400,
            fontSize: 13, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.18s',
            outline: hasError ? '2px solid var(--red)' : 'none',
            boxShadow: value === opt ? '0 0 12px rgba(22,197,248,0.2)' : 'none',
          }}
        >
          {opt === 'Yes' ? '✓  Yes' : '✗  No'}
        </button>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Onboarding({ navigate, requireComplete = false, setUserProfile }) {
  const [formData, setFormData] = useState({
    company: '',
    industry: '',
    country: '',
    targetCountries: [],
    revenue: '',
    capacity: '',
    certificates: [],
    paymentTerms: '',
    responseSpeed: '',
    responseScore: 5,
    teamSize: '',
    hiring: '',
  })

  const [errors, setErrors] = useState({})
  const [shaking, setShaking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mlRunning, setMlRunning] = useState(false)   // ← NEW: separate ML loading state
  const [saveError, setSaveError] = useState(null)

  const btnRef = useRef(null)
  const cardRef = useRef(null)

  useLayoutEffect(() => {
    if (!cardRef.current) return
    const tween = gsap.fromTo(
      cardRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: 0.1 }
    )
    return () => tween.kill()
  }, [])

  const set = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: false }))
    if (field === 'country' && typeof setUserProfile === 'function') {
      setUserProfile(prev => ({ ...prev, country: value }))
    }
  }

  const clearError = field => setErrors(prev => ({ ...prev, [field]: false }))

  const validateAndProceed = async () => {
    const newErrors = {}
    if (!formData.company.trim()) newErrors.company = true
    if (!formData.industry) newErrors.industry = true
    if (!formData.country) newErrors.country = true
    if (!formData.targetCountries.length) newErrors.targetCountries = true
    if (!formData.revenue) newErrors.revenue = true
    if (!formData.capacity.toString().trim()) newErrors.capacity = true
    if (!formData.certificates.length) newErrors.certificates = true
    if (!formData.paymentTerms) newErrors.paymentTerms = true
    if (!formData.responseSpeed) newErrors.responseSpeed = true
    if (!formData.teamSize) newErrors.teamSize = true
    if (!formData.hiring) newErrors.hiring = true

    setErrors(newErrors)

    if (Object.keys(newErrors).length) {
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // ── Build API payload ─────────────────────────────────────────────────
    const payload = {
      company_name: formData.company.trim(),
      industry: formData.industry,
      hq_country: formData.country,
      target_countries: formData.targetCountries,
      annual_revenue_usd: REVENUE_MAP[formData.revenue] ?? 0,
      manufacturing_capacity: formData.capacity.trim(),
      certifications: formData.certificates,
      good_payment_terms: formData.paymentTerms === 'Yes',
      response_speed: formData.responseSpeed,
      prompt_response_score: formData.responseScore,
      team_size: TEAM_SIZE_MAP[formData.teamSize] ?? formData.teamSize,
      is_hiring: formData.hiring === 'Yes',
      linkedin_active: false,
    }

    setSaving(true)
    setSaveError(null)

    try {
      // 1. Save exporter profile to Supabase via backend
      await api.saveProfile(payload)
      setSaving(false)

      // 2. Run ML sync so matches are ready when user hits Matches page
      setMlRunning(true)
      await api.runML()
      setMlRunning(false)

      // 3. Navigate to discover
      navigate('discover', { requireComplete: false })
    } catch (err) {
      console.error('Onboarding save failed:', err)
      setSaveError('Failed to save profile. Please try again.')
      setSaving(false)
      setMlRunning(false)
    }
  }

  // Derive button label from state
  const btnLabel = saving ? 'Saving…' : mlRunning ? 'Finding your matches…' : 'Save & Continue'
  const isBusy = saving || mlRunning

  /* SVG icons */
  const BriefIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
  const MonitorIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
  const PinIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
  const GlobeIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
  const DollarIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  const FactoryIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20" /><path d="M2 8l6-4v8" /><path d="M14 4l6 4v12" /><rect x="8" y="8" width="6" height="12" /></svg>
  const AwardIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
  const UsersIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  const ClockIcon = <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>

  return (
    <div className="auth-bg" style={{ alignItems: 'flex-start' }}>
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />
      <div className="glow-orb glow-orb-4" />
      <div className="glow-orb glow-orb-5" />

      {/* Topbar */}
      <div className="ob-topbar" style={{ width: '100%' }}>
        <div className="logo-wrap">
          <div className="logo-diamond">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
              <path d="M12 7v4M12 11l-5.5 6M12 11l5.5 6" />
            </svg>
          </div>
          NexaTrade
        </div>
        <div className="step-info">
          Step 2 of 4
          <div className="step-bar"><div className="step-fill" /></div>
        </div>
      </div>

      <div className="ob-body" style={{ width: '100%', position: 'relative', zIndex: 100 }}>
        <div className="ob-card" ref={cardRef}>
          <h2>Complete Your Business Profile</h2>
          <p className="sub">Let's get your company set up for the best matchmaking results.</p>

          {/* Avatar */}
          <div className="avatar-zone">
            <div className="avatar-ring">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="30" r="16" fill="rgba(80,116,255,0.5)" />
                <ellipse cx="40" cy="65" rx="26" ry="16" fill="rgba(80,116,255,0.4)" />
                <circle cx="40" cy="30" r="13" fill="rgba(86,146,249,0.7)" />
                <path d="M18 70 Q20 54 40 54 Q60 54 62 70Z" fill="rgba(14,18,96,0.8)" />
              </svg>
              <div className="avatar-edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
            </div>
            <a href="#">Edit Profile Photo</a>
          </div>

          {/* Form Grid */}
          <div className="form-grid">

            <div id="field-company" className={`form-field form-full${errors.company ? ' has-error' : ''}`}>
              <label>Company Name <span className="req-star">*</span></label>
              <div className="fi">
                {BriefIcon}
                <input type="text" placeholder="e.g. Tata Enterprises Ltd." value={formData.company} onChange={e => set('company', e.target.value)} />
              </div>
              <div className="field-error">Please enter your company name.</div>
            </div>

            <div id="field-industry" className={`form-field${errors.industry ? ' has-error' : ''}`}>
              <label>Industry <span className="req-star">*</span></label>
              <SearchDropdown options={INDUSTRIES} value={formData.industry} onChange={v => set('industry', v)} placeholder="Search industry…" icon={MonitorIcon} hasError={errors.industry} onFocus={() => clearError('industry')} />
              <div className="field-error">Please select your industry.</div>
            </div>

            <div id="field-country" className={`form-field${errors.country ? ' has-error' : ''}`}>
              <label>Headquarters Country <span className="req-star">*</span></label>
              <SearchDropdown options={COUNTRIES} value={formData.country} onChange={v => set('country', v)} placeholder="Search country…" icon={PinIcon} hasError={errors.country} onFocus={() => clearError('country')} />
              <div className="field-error">Please select your country.</div>
            </div>

            <div id="field-targetCountries" className={`form-field form-full${errors.targetCountries ? ' has-error' : ''}`}>
              <label>Target Countries <span className="req-star">*</span></label>
              <MultiDropdown options={COUNTRIES} value={formData.targetCountries} onChange={v => set('targetCountries', v)} placeholder="Select target markets…" icon={GlobeIcon} hasError={errors.targetCountries} onFocus={() => clearError('targetCountries')} />
              <div className="field-error">Please select at least one target country.</div>
            </div>

            <div id="field-revenue" className={`form-field${errors.revenue ? ' has-error' : ''}`}>
              <label>Annual Revenue <span className="req-star">*</span></label>
              <SearchDropdown options={REVENUE_RANGES} value={formData.revenue} onChange={v => set('revenue', v)} placeholder="Select revenue range…" icon={DollarIcon} hasError={errors.revenue} onFocus={() => clearError('revenue')} />
              <div className="field-error">Please select your annual revenue range.</div>
            </div>

            <div id="field-capacity" className={`form-field${errors.capacity ? ' has-error' : ''}`}>
              <label>Manufacturing Capacity (Annual) <span className="req-star">*</span></label>
              <div className="fi">
                {FactoryIcon}
                <input type="text" placeholder="e.g. 50,000 units / 200 MT" value={formData.capacity} onChange={e => set('capacity', e.target.value)} />
              </div>
              <div className="field-error">Please enter your manufacturing capacity.</div>
            </div>

            <div id="field-certificates" className={`form-field form-full${errors.certificates ? ' has-error' : ''}`}>
              <label>Certifications <span className="req-star">*</span></label>
              <MultiDropdown options={CERT_OPTIONS} value={formData.certificates} onChange={v => set('certificates', v)} placeholder="Select certifications…" icon={AwardIcon} hasError={errors.certificates} onFocus={() => clearError('certificates')} />
              <div className="field-error">Please select at least one certification.</div>
            </div>

            <div id="field-paymentTerms" className={`form-field${errors.paymentTerms ? ' has-error' : ''}`}>
              <label>Offers Good Payment Terms <span className="req-star">*</span></label>
              <YesNoToggle value={formData.paymentTerms} onChange={v => set('paymentTerms', v)} hasError={errors.paymentTerms} />
              <div className="field-error">Please indicate your payment terms.</div>
            </div>

            <div id="field-responseSpeed" className={`form-field${errors.responseSpeed ? ' has-error' : ''}`}>
              <label>Response Speed <span className="req-star">*</span></label>
              <SearchDropdown options={RESPONSE_SPEEDS} value={formData.responseSpeed} onChange={v => set('responseSpeed', v)} placeholder="Select response speed…" icon={ClockIcon} hasError={errors.responseSpeed} onFocus={() => clearError('responseSpeed')} />
              <div className="field-error">Please select your typical response speed.</div>
            </div>

            <div id="field-responseScore" className="form-field form-full">
              <label>
                Response Score
                <span style={{ marginLeft: 8, fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>{formData.responseScore} / 10</span>
                <span className="req-star" style={{ marginLeft: 4 }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>1 — Slow</span>
                <input
                  type="range" min={1} max={10} step={1}
                  value={formData.responseScore}
                  onChange={e => set('responseScore', Number(e.target.value))}
                  style={{
                    flex: 1, appearance: 'none', height: 5, borderRadius: 6,
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(formData.responseScore - 1) / 9 * 100}%, rgba(255,255,255,0.12) ${(formData.responseScore - 1) / 9 * 100}%, rgba(255,255,255,0.12) 100%)`,
                    outline: 'none', cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>10 — Fast</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingInline: 0, marginTop: 4 }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} style={{ fontSize: 10, color: i + 1 === formData.responseScore ? 'var(--accent)' : 'var(--text-dim)', fontWeight: i + 1 === formData.responseScore ? 700 : 400 }}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>

            <div id="field-teamSize" className={`form-field${errors.teamSize ? ' has-error' : ''}`}>
              <label>Team Size <span className="req-star">*</span></label>
              <SearchDropdown options={TEAM_SIZES} value={formData.teamSize} onChange={v => set('teamSize', v)} placeholder="Select team size…" icon={UsersIcon} hasError={errors.teamSize} onFocus={() => clearError('teamSize')} />
              <div className="field-error">Please select your team size.</div>
            </div>

            <div id="field-hiring" className={`form-field${errors.hiring ? ' has-error' : ''}`}>
              <label>Are You Currently Hiring? <span className="req-star">*</span></label>
              <YesNoToggle value={formData.hiring} onChange={v => set('hiring', v)} hasError={errors.hiring} />
              <div className="field-error">Please indicate your hiring status.</div>
            </div>

          </div>

          {/* API error */}
          {saveError && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,70,90,0.12)', border: '1px solid rgba(248,70,90,0.3)', borderRadius: 10, color: '#f8465a', fontSize: 13 }}>
              {saveError}
            </div>
          )}

          {/* ML running notice */}
          {mlRunning && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(22,197,248,0.08)', border: '1px solid rgba(22,197,248,0.25)', borderRadius: 10, color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Running AI matchmaking… this may take 30–60 seconds.
            </div>
          )}

          {/* Footer */}
          <div className="ob-footer">
            {!requireComplete && (
              <button className="skip-btn" onClick={() => navigate('discover')} disabled={isBusy}>Skip for now</button>
            )}
            <button
              ref={btnRef}
              className="btn btn-primary"
              style={{ animation: shaking ? 'shake 0.4s ease' : 'none', opacity: isBusy ? 0.7 : 1 }}
              onClick={validateAndProceed}
              disabled={isBusy}
            >
              {btnLabel}
              {!isBusy && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      <div className="ob-legal">
        By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}