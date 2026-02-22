import { useState } from 'react'
import { supabase } from '../services/api'

/* ─── icons ─── */
const EyeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
const EyeOffIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
const ArrowRight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
const ArrowLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
const AddUserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
const BriefcaseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></svg>

/* ══════════════════════════════════════════
   BAUHAUS GEO PANEL — animated hoverable boxes
══════════════════════════════════════════ */
const GEO_CELLS = [
  { bg: '#4f83ff', shape: 'arc-br', accent: '#101b80' },
  { bg: '#172596', shape: 'full-circ', accent: 'rgba(255,255,255,0.9)' },
  { bg: '#7c6bef', shape: 'arc-tl', accent: '#101b80' },
  { bg: '#4f83ff', shape: 'plain', accent: null },
  { bg: '#101b80', shape: 'plain', accent: null },
  { bg: '#7c6bef', shape: 'arc-bl', accent: '#4f83ff' },
  { bg: '#4f83ff', shape: 'plain', accent: null },
  { bg: '#172596', shape: 'dot-circ', accent: '#34c2bb' },
  { bg: '#101b80', shape: 'arc-tr', accent: '#7c6bef' },
  { bg: '#7c6bef', shape: 'plain', accent: null },
  { bg: '#101b80', shape: 'full-circ', accent: 'rgba(255,255,255,0.8)' },
  { bg: '#4f83ff', shape: 'arc-br', accent: '#172596' },
  { bg: '#34c2bb', shape: 'plus', accent: 'rgba(255,255,255,0.9)' },
  { bg: '#7c6bef', shape: 'arc-tl', accent: '#101b80' },
  { bg: '#4f83ff', shape: 'arc-bl', accent: '#172596' },
  { bg: '#172596', shape: 'plain', accent: null },
  { bg: '#7c6bef', shape: 'dot-circ', accent: 'rgba(255,255,255,0.85)' },
  { bg: '#4f83ff', shape: 'arc-tr', accent: '#101b80' },
  { bg: '#101b80', shape: 'full-circ', accent: '#34c2bb' },
  { bg: '#172596', shape: 'plain', accent: null },
]

function GeoCell({ bg, shape, accent }) {
  const [hovered, setHovered] = useState(false)
  const inner = (() => {
    switch (shape) {
      case 'arc-br': return (
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '85%', height: '85%', borderRadius: '85% 0 0 0', background: accent, opacity: .9 }} />
      )
      case 'arc-tl': return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '85%', height: '85%', borderRadius: '0 0 85% 0', background: accent, opacity: .9 }} />
      )
      case 'arc-bl': return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '85%', height: '85%', borderRadius: '0 85% 0 0', background: accent, opacity: .9 }} />
      )
      case 'arc-tr': return (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '85%', height: '85%', borderRadius: '0 0 0 85%', background: accent, opacity: .9 }} />
      )
      case 'full-circ': return (
        <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', background: accent }} />
      )
      case 'dot-circ': return (
        <>
          <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', background: accent }} />
          <div style={{ position: 'absolute', inset: '35%', borderRadius: '50%', background: bg, zIndex: 2 }} />
        </>
      )
      case 'plus': return (
        <>
          <div style={{ position: 'absolute', top: '50%', left: '20%', right: '20%', height: 8, transform: 'translateY(-50%)', background: accent, borderRadius: 4 }} />
          <div style={{ position: 'absolute', left: '50%', top: '20%', bottom: '20%', width: 8, transform: 'translateX(-50%)', background: accent, borderRadius: 4 }} />
        </>
      )
      default: return null
    }
  })()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), z-index 0s',
        transform: hovered ? 'scale(1.18)' : 'scale(1)',
        zIndex: hovered ? 10 : 1,
        cursor: 'default',
        borderRadius: 2,
      }}
    >
      {inner}
    </div>
  )
}

function GeometricPanel() {
  return (
    <div style={{
      flex: '0 0 46%',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #101b80 0%, #172596 70%, #1e2fa8 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 20px',
    }}>
      <div style={{ position: 'relative', zIndex: 20, marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34c2bb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
            <path d="M12 7v4M12 11l-5.5 6M12 11l5.5 6" />
          </svg>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>NexaTrade</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, lineHeight: 1.5 }}>
          AI-powered B2B trade<br />matchmaking platform
        </p>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 3,
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}>
        {GEO_CELLS.map((c, i) => (
          <GeoCell key={i} {...c} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 20, marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 14, flexShrink: 0 }}>
        {[['10K+', 'Partners'], ['₹500Cr+', 'Trade'], ['42', 'Countries']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent)', lineHeight: 1.2 }}>{n}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════ LOGIN VIEW ══ */
function LoginView({ navigate }) {
  const [showPwd, setShowPwd] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    navigate('onboard')
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden',
      background: 'linear-gradient(135deg,#101b80 0%,#1e2fa8 60%,#172596 100%)',
    }}>
      <GeometricPanel />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb glow-orb-1" /><div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-4" /><div className="glow-orb glow-orb-5" />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: '0 8px 24px rgba(52,194,187,0.35)' }}>
            <BriefcaseIcon />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Welcome Back</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 32 }}>Sign in to your NexaTrade account</p>

          <div style={{ background: 'rgba(16,22,100,0.85)', border: '1px solid rgba(52,194,187,0.22)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Email</div>
            <div className="input-wrap" style={{ marginBottom: 20 }}>
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</div>
              <a href="#" style={{ fontSize: 12, color: 'var(--accent)' }}>Forgot password?</a>
            </div>
            <div className="input-wrap" style={{ marginBottom: 28 }}>
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button className="eye-btn" onClick={() => setShowPwd(v => !v)} type="button">{showPwd ? <EyeOffIcon /> : <EyeIcon />}</button>
            </div>

            {error && (
              <div style={{ color: '#f8465a', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>⚠ {error}</div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing in…' : <> Login <ArrowRight /> </>}
              </button>
              <button className="btn btn-dark" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('register')}>
                Register
              </button>
            </div>

            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6 }}>
              By logging in you agree to our <a href="#" style={{ color: 'var(--accent)' }}>Terms</a> and <a href="#" style={{ color: 'var(--accent)' }}>Privacy Policy</a>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 18 }}>© 2025 NexaTrade. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════ REGISTER VIEW ══ */
function RegisterView({ navigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [strength, setStrength] = useState({ pct: '0%', bg: '', label: '' })
  const [matchErr, setMatchErr] = useState(false)
  const [emailOk, setEmailOk] = useState(false)
  const [confirmOk, setConfirmOk] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const LEVELS = [
    { pct: '25%', bg: '#f8465a', label: 'Weak' },
    { pct: '50%', bg: '#F59E0B', label: 'Fair' },
    { pct: '75%', bg: '#4f83ff', label: 'Good' },
    { pct: '100%', bg: '#22C55E', label: 'Strong' },
  ]

  const handlePassword = (val) => {
    setPassword(val)
    let s = 0
    if (val.length >= 8) s++
    if (/[A-Z]/.test(val)) s++
    if (/[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    setStrength(val.length ? LEVELS[Math.max(0, s - 1)] : { pct: '0%', bg: '', label: '' })
    validateConfirm(confirm, val)
  }

  const validateConfirm = (cf, pw) => {
    if (!cf) { setMatchErr(false); setConfirmOk(false); return }
    if (cf === pw) { setMatchErr(false); setConfirmOk(true) }
    else { setMatchErr(true); setConfirmOk(false) }
  }

  const handleRegister = async () => {
    setError('')
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return }
    if (password !== confirm) { setMatchErr(true); return }
    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setLoading(false); setError(signUpError.message); return }
    // Auto sign-in after signup so session is ready for onboarding
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (loginError) { setError('Account created! Please log in.'); navigate('login'); return }
    navigate('onboard')
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden',
      background: 'linear-gradient(135deg,#101b80 0%,#1e2fa8 60%,#172596 100%)',
    }}>
      <GeometricPanel />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb glow-orb-1" /><div className="glow-orb glow-orb-3" />
        <div className="glow-orb glow-orb-5" />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: '0 8px 24px rgba(52,194,187,0.35)' }}>
            <AddUserIcon />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 32 }}>Join NexaTrade — your global B2B gateway</p>

          <div style={{ background: 'rgba(16,22,100,0.85)', border: '1px solid rgba(52,194,187,0.22)', borderRadius: 20, padding: '28px 28px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Email</div>
            <div className="input-wrap" style={{ marginBottom: 18 }}>
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                className={emailOk ? 'input-success' : ''}
                onChange={e => { setEmail(e.target.value); setEmailOk(e.target.value.includes('@') && e.target.value.length > 5) }}
              />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Password</div>
            <div className="input-wrap" style={{ marginBottom: 6 }}>
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <input type={showPwd ? 'text' : 'password'} placeholder="Create a strong password" value={password} onChange={e => handlePassword(e.target.value)} />
              <button className="eye-btn" onClick={() => setShowPwd(v => !v)} type="button">{showPwd ? <EyeOffIcon /> : <EyeIcon />}</button>
            </div>
            <div className={`strength-bar-wrap${password.length ? ' active' : ''}`} style={{ marginBottom: 4 }}>
              <div className="strength-bar" style={{ width: strength.pct, background: strength.bg }} />
            </div>
            <div className="strength-label" style={{ marginBottom: 14 }}>{strength.label}</div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Confirm Password</div>
            <div className="input-wrap" style={{ marginBottom: 4 }}>
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <input
                type={showConf ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirm}
                className={confirmOk ? 'input-success' : ''}
                onChange={e => { setConfirm(e.target.value); validateConfirm(e.target.value, password) }}
              />
              <button className="eye-btn" onClick={() => setShowConf(v => !v)} type="button">{showConf ? <EyeOffIcon /> : <EyeIcon />}</button>
            </div>
            <div className={`match-error${matchErr ? ' show' : ''}`} style={{ marginBottom: 8 }}>⚠ Passwords do not match.</div>

            {error && (
              <div style={{ color: '#f8465a', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>⚠ {error}</div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1, marginTop: 8 }}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Creating account…' : <> Create Account <ArrowRight /> </>}
            </button>

            <div style={{ fontSize: 12, textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.4)' }}>
              Already have an account?{' '}
              <a href="#" style={{ color: 'var(--accent)' }} onClick={e => { e.preventDefault(); navigate('login') }}>Sign in</a>
            </div>
          </div>
          <button onClick={() => navigate('login')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 12, marginTop: 14, padding: 0 }}>
            <ArrowLeft /> Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Login({ navigate, initialView = 'login' }) {
  return initialView === 'register'
    ? <RegisterView navigate={navigate} />
    : <LoginView navigate={navigate} />
}