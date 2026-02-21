import { useState, useRef, useEffect } from 'react'

/* ══════════════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════════════ */
const INDUSTRIES = [
  'Agriculture','Aerospace','Automotive','BioTech','Chemicals','Construction',
  'Consumer Goods','Defense','E-commerce','Education','Energy','Engineering',
  'FinTech','Food & Beverage','Healthcare','IT Software','Logistics',
  'Machinery','Manufacturing','Maritime','Medical Devices','Mining',
  'Pharmaceuticals','Retail','Robotics & AI','SaaS','Solar & Renewables',
  'Steel & Metals','Supply Chain','Telecommunications','Textiles',
  'Transportation','Waste Management',
]

const COUNTRIES = [
  'Afghanistan','Argentina','Australia','Austria','Bangladesh','Belgium',
  'Brazil','Canada','Chile','China','Colombia','Denmark','Egypt',
  'Ethiopia','Finland','France','Germany','Ghana','Greece','Hungary',
  'India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Japan','Jordan','Kenya','South Korea','Malaysia','Mexico','Morocco',
  'Netherlands','New Zealand','Nigeria','Norway','Pakistan','Philippines',
  'Poland','Portugal','Romania','Russia','Saudi Arabia','Singapore',
  'South Africa','Spain','Sri Lanka','Sweden','Switzerland','Taiwan',
  'Thailand','Turkey','Ukraine','United Arab Emirates','United Kingdom',
  'United States of America','Vietnam','Zimbabwe',
]

const REVENUE_RANGES = [
  'Under $100K','$100K – $500K','$500K – $1M',
  '$1M – $5M','$5M – $25M','$25M – $100M','$100M+',
]

const TEAM_SIZES = [
  '1 – 10','11 – 50','51 – 200','201 – 500','501 – 1,000','1,000+',
]

const CERT_OPTIONS = [
  'ISO 9001','ISO 14001','ISO 45001','CE Mark','FDA Approved',
  'GMP','HACCP','REACH','RoHS','SA8000','SMETA','SOC 2',
]

const RESPONSE_SPEEDS = ['Slow (> 5 days)','Moderate (2 – 5 days)','Fast (< 48 hours)']


/* ══════════════════════════════════════════════════════════════
   REUSABLE: SEARCHABLE SINGLE-SELECT DROPDOWN
   Styled to match existing .fi / input patterns
══════════════════════════════════════════════════════════════ */
function SearchDropdown({ options, value, onChange, placeholder, icon, hasError, onFocus }) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const wrapRef             = useRef(null)

  // Close on outside click
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
          style={{ color: value && !open ? 'var(--navy)' : undefined }}
          readOnly={false}
          autoComplete="off"
        />
        {/* Chevron */}
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none', color: 'var(--gray-400)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999,
          background: '#fff', borderRadius: 10, border: '1.5px solid var(--gray-200)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', maxHeight: 200, overflowY: 'auto',
        }}>
          {filtered.map(opt => (
            <div
              key={opt}
              onMouseDown={() => select(opt)}
              style={{
                padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                color: opt === value ? 'var(--blue)' : 'var(--navy)',
                fontWeight: opt === value ? 700 : 400,
                background: opt === value ? 'var(--blue-light)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50,#f8fafc)'}
              onMouseLeave={e => e.currentTarget.style.background = opt === value ? 'var(--blue-light)' : 'transparent'}
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
  const [open, setOpen]   = useState(false)
  const wrapRef           = useRef(null)

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
      {/* Selected chips + input */}
      <div
        className={`fi${hasError ? ' fi-error' : ''}`}
        style={{ flexWrap: 'wrap', minHeight: 44, height: 'auto', gap: 4, paddingTop: value.length ? 6 : undefined, paddingBottom: value.length ? 6 : undefined, cursor: 'text', alignItems: 'center' }}
        onClick={() => { setOpen(true) }}
      >
        {icon}
        {value.map(v => (
          <span key={v} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--blue-light,#EEF1FF)', color: 'var(--blue)', borderRadius: 6,
            padding: '2px 8px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {v}
            <span onMouseDown={e => remove(v, e)} style={{ cursor: 'pointer', lineHeight: 1, marginLeft: 2, opacity: 0.6 }}>✕</span>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          placeholder={value.length ? '' : placeholder}
          style={{ flex: 1, minWidth: 80, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--navy)', fontFamily: 'inherit' }}
          autoComplete="off"
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none', color: 'var(--gray-400)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999,
          background: '#fff', borderRadius: 10, border: '1.5px solid var(--gray-200)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', maxHeight: 200, overflowY: 'auto',
        }}>
          {/* Already selected — shown with checkmark */}
          {value.map(v => (
            <div key={v} onMouseDown={() => toggle(v)} style={{
              padding: '9px 14px', fontSize: 13, cursor: 'pointer',
              color: 'var(--blue)', fontWeight: 700, background: 'var(--blue-light,#EEF1FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              {v} <span style={{ fontSize: 11 }}>✓</span>
            </div>
          ))}
          {/* Remaining options */}
          {filtered.length > 0
            ? filtered.map(opt => (
                <div key={opt} onMouseDown={() => toggle(opt)} style={{
                  padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                  color: 'var(--navy)', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {opt}
                </div>
              ))
            : <div style={{ padding: '9px 14px', fontSize: 12, color: 'var(--gray-400)' }}>No results</div>
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
            flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid',
            borderColor: value === opt ? 'var(--blue)' : 'var(--gray-200)',
            background: value === opt ? 'var(--blue-light,#EEF1FF)' : '#fff',
            color: value === opt ? 'var(--blue)' : 'var(--gray-400)',
            fontWeight: value === opt ? 700 : 400,
            fontSize: 13, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.15s',
            outline: hasError ? '2px solid #EF4444' : 'none',
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
export default function Onboarding({ navigate }) {
  /* ── Form state (single object for clean validation) ── */
  const [formData, setFormData] = useState({
    company:        '',
    industry:       '',
    country:        '',
    targetCountries: [],
    revenue:        '',
    capacity:       '',
    certificates:   [],
    paymentTerms:   '',
    responseSpeed:  '',
    responseScore:  5,
    teamSize:       '',
    hiring:         '',
  })

  const [errors,   setErrors]   = useState({})
  const [shaking,  setShaking]  = useState(false)
  const btnRef = useRef(null)

  /* ── Helpers ── */
  const set = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: false }))
  }

  const clearError = field => setErrors(prev => ({ ...prev, [field]: false }))

  /* ── Validation ── */
  const validateAndProceed = () => {
    const newErrors = {}

    if (!formData.company.trim())              newErrors.company        = true
    if (!formData.industry)                    newErrors.industry       = true
    if (!formData.country)                     newErrors.country        = true
    if (!formData.targetCountries.length)      newErrors.targetCountries = true
    if (!formData.revenue)                     newErrors.revenue        = true
    if (!formData.capacity.toString().trim())  newErrors.capacity       = true
    if (!formData.certificates.length)         newErrors.certificates   = true
    if (!formData.paymentTerms)                newErrors.paymentTerms   = true
    if (!formData.responseSpeed)               newErrors.responseSpeed  = true
    if (!formData.teamSize)                    newErrors.teamSize       = true
    if (!formData.hiring)                      newErrors.hiring         = true

    setErrors(newErrors)

    if (Object.keys(newErrors).length) {
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
      // Scroll first error into view
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    navigate('discover')
  }

  /* ── SVG icon helpers ── */
  const BriefIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  )
  const MonitorIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
  const PinIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
  const GlobeIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
  const DollarIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
  const FactoryIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20"/><path d="M2 8l6-4v8"/><path d="M14 4l6 4v12"/><rect x="8" y="8" width="6" height="12"/>
    </svg>
  )
  const AwardIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  )
  const UsersIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
  const ClockIcon = (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )

  /* ── Render ── */
  return (
    <div className="page-onboard">

      {/* ── Topbar (unchanged) ── */}
      <div className="ob-topbar">
        <div className="logo-wrap">
          <div className="logo-diamond">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
              <line x1="12" y1="22" x2="12" y2="15.5"/>
              <polyline points="22 8.5 12 15.5 2 8.5"/>
            </svg>
          </div>
          MatchMaker B2B
        </div>
        <div className="step-info">
          Step 2 of 4
          <div className="step-bar"><div className="step-fill" /></div>
        </div>
      </div>

      <div className="ob-body">
        <div className="ob-card">
          <h2>Complete Your Business Profile</h2>
          <p className="sub">Let's get your company set up for the best matchmaking results.</p>

          {/* ── Avatar (unchanged) ── */}
          <div className="avatar-zone">
            <div className="avatar-ring">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="30" r="16" fill="#9CA3AF"/>
                <ellipse cx="40" cy="65" rx="26" ry="16" fill="#9CA3AF"/>
                <circle cx="40" cy="30" r="13" fill="#D1D5DB"/>
                <path d="M18 70 Q20 54 40 54 Q60 54 62 70Z" fill="#1A1F36"/>
              </svg>
              <div className="avatar-edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </div>
            <a href="#">Edit Profile Photo</a>
          </div>

          {/* ══════════════════════════════════════════
              FORM GRID
          ══════════════════════════════════════════ */}
          <div className="form-grid">

            {/* 1 — Company Name */}
            <div id="field-company" className={`form-field form-full${errors.company ? ' has-error' : ''}`}>
              <label>Company Name <span className="req-star">*</span></label>
              <div className="fi">
                {BriefIcon}
                <input
                  type="text"
                  placeholder="e.g. Acme Enterprise Solutions"
                  value={formData.company}
                  onChange={e => set('company', e.target.value)}
                />
              </div>
              <div className="field-error">Please enter your company name.</div>
            </div>

            {/* 2 — Industry */}
            <div id="field-industry" className={`form-field${errors.industry ? ' has-error' : ''}`}>
              <label>Industry <span className="req-star">*</span></label>
              <SearchDropdown
                options={INDUSTRIES}
                value={formData.industry}
                onChange={v => set('industry', v)}
                placeholder="Search industry…"
                icon={MonitorIcon}
                hasError={errors.industry}
                onFocus={() => clearError('industry')}
              />
              <div className="field-error">Please select your industry.</div>
            </div>

            {/* 3 — Country (HQ) */}
            <div id="field-country" className={`form-field${errors.country ? ' has-error' : ''}`}>
              <label>Headquarters Country <span className="req-star">*</span></label>
              <SearchDropdown
                options={COUNTRIES}
                value={formData.country}
                onChange={v => set('country', v)}
                placeholder="Search country…"
                icon={PinIcon}
                hasError={errors.country}
                onFocus={() => clearError('country')}
              />
              <div className="field-error">Please select your country.</div>
            </div>

            {/* 4 — Target Countries (Multi-select) */}
            <div id="field-targetCountries" className={`form-field form-full${errors.targetCountries ? ' has-error' : ''}`}>
              <label>Target Countries <span className="req-star">*</span></label>
              <MultiDropdown
                options={COUNTRIES}
                value={formData.targetCountries}
                onChange={v => set('targetCountries', v)}
                placeholder="Select target markets…"
                icon={GlobeIcon}
                hasError={errors.targetCountries}
                onFocus={() => clearError('targetCountries')}
              />
              <div className="field-error">Please select at least one target country.</div>
            </div>

            {/* 5 — Annual Revenue */}
            <div id="field-revenue" className={`form-field${errors.revenue ? ' has-error' : ''}`}>
              <label>Annual Revenue <span className="req-star">*</span></label>
              <SearchDropdown
                options={REVENUE_RANGES}
                value={formData.revenue}
                onChange={v => set('revenue', v)}
                placeholder="Select revenue range…"
                icon={DollarIcon}
                hasError={errors.revenue}
                onFocus={() => clearError('revenue')}
              />
              <div className="field-error">Please select your annual revenue range.</div>
            </div>

            {/* 6 — Manufacturing Capacity */}
            <div id="field-capacity" className={`form-field${errors.capacity ? ' has-error' : ''}`}>
              <label>Manufacturing Capacity (Annual) <span className="req-star">*</span></label>
              <div className="fi">
                {FactoryIcon}
                <input
                  type="text"
                  placeholder="e.g. 50,000 units / 200 MT"
                  value={formData.capacity}
                  onChange={e => set('capacity', e.target.value)}
                />
              </div>
              <div className="field-error">Please enter your manufacturing capacity.</div>
            </div>

            {/* 7 — Certificates (Multi-select) */}
            <div id="field-certificates" className={`form-field form-full${errors.certificates ? ' has-error' : ''}`}>
              <label>Certifications <span className="req-star">*</span></label>
              <MultiDropdown
                options={CERT_OPTIONS}
                value={formData.certificates}
                onChange={v => set('certificates', v)}
                placeholder="Select certifications…"
                icon={AwardIcon}
                hasError={errors.certificates}
                onFocus={() => clearError('certificates')}
              />
              <div className="field-error">Please select at least one certification.</div>
            </div>

            {/* 8 — Good Payment Terms */}
            <div id="field-paymentTerms" className={`form-field${errors.paymentTerms ? ' has-error' : ''}`}>
              <label>Offers Good Payment Terms <span className="req-star">*</span></label>
              <YesNoToggle
                value={formData.paymentTerms}
                onChange={v => set('paymentTerms', v)}
                hasError={errors.paymentTerms}
              />
              <div className="field-error">Please indicate your payment terms.</div>
            </div>

            {/* 9 — Response Speed */}
            <div id="field-responseSpeed" className={`form-field${errors.responseSpeed ? ' has-error' : ''}`}>
              <label>Response Speed <span className="req-star">*</span></label>
              <SearchDropdown
                options={RESPONSE_SPEEDS}
                value={formData.responseSpeed}
                onChange={v => set('responseSpeed', v)}
                placeholder="Select response speed…"
                icon={ClockIcon}
                hasError={errors.responseSpeed}
                onFocus={() => clearError('responseSpeed')}
              />
              <div className="field-error">Please select your typical response speed.</div>
            </div>

            {/* 10 — Response Score (Slider) */}
            <div id="field-responseScore" className="form-field form-full">
              <label>
                Response Score
                <span style={{ marginLeft: 8, fontWeight: 700, color: 'var(--blue)', fontSize: 14 }}>
                  {formData.responseScore} / 10
                </span>
                <span className="req-star" style={{ marginLeft: 4 }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>1 — Slow</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={formData.responseScore}
                  onChange={e => set('responseScore', Number(e.target.value))}
                  style={{
                    flex: 1, appearance: 'none', height: 6, borderRadius: 6,
                    background: `linear-gradient(to right, var(--blue) 0%, var(--blue) ${(formData.responseScore - 1) / 9 * 100}%, var(--gray-200) ${(formData.responseScore - 1) / 9 * 100}%, var(--gray-200) 100%)`,
                    outline: 'none', cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>10 — Fast</span>
              </div>
              {/* Tick marks */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingInline: 0, marginTop: 4 }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} style={{ fontSize: 10, color: i + 1 === formData.responseScore ? 'var(--blue)' : 'var(--gray-400)', fontWeight: i + 1 === formData.responseScore ? 700 : 400 }}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>

            {/* 11 — Team Size */}
            <div id="field-teamSize" className={`form-field${errors.teamSize ? ' has-error' : ''}`}>
              <label>Team Size <span className="req-star">*</span></label>
              <SearchDropdown
                options={TEAM_SIZES}
                value={formData.teamSize}
                onChange={v => set('teamSize', v)}
                placeholder="Select team size…"
                icon={UsersIcon}
                hasError={errors.teamSize}
                onFocus={() => clearError('teamSize')}
              />
              <div className="field-error">Please select your team size.</div>
            </div>

            {/* 12 — Are You Hiring? */}
            <div id="field-hiring" className={`form-field${errors.hiring ? ' has-error' : ''}`}>
              <label>Are You Currently Hiring? <span className="req-star">*</span></label>
              <YesNoToggle
                value={formData.hiring}
                onChange={v => set('hiring', v)}
                hasError={errors.hiring}
              />
              <div className="field-error">Please indicate your hiring status.</div>
            </div>

          </div>
          {/* /form-grid */}

          {/* ── Footer buttons (unchanged) ── */}
          <div className="ob-footer">
            <button className="skip-btn" onClick={() => navigate('discover')}>Skip for now</button>
            <button
              ref={btnRef}
              className="btn btn-primary"
              style={{ animation: shaking ? 'shake 0.4s ease' : 'none' }}
              onClick={validateAndProceed}
            >
              Save &amp; Continue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── Legal footer (unchanged) ── */}
      <div className="ob-legal">
        By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
