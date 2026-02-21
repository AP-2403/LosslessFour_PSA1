import { useState } from 'react'

/* ─── SVG helpers ─── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
)
const AddUserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)

/* ══════════════════════════════════════════
   LOGIN VIEW
══════════════════════════════════════════ */
function LoginView({ navigate }) {
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className="page-login">
      <div className="login-wrap">
        <div className="login-icon">
          <BriefcaseIcon />
        </div>
        <h1>Enterprise Portal</h1>
        <p>Secure access for authorized personnel only</p>

        <div className="login-card">
          <div className="field-label">Username</div>
          <div className="input-wrap">
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input type="text" placeholder="Enter your corporate ID" />
          </div>

          <div className="field-label">
            Password
            <a href="#">Forgot password?</a>
          </div>
          <div className="input-wrap">
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input type={showPwd ? 'text' : 'password'} placeholder="Enter your password" />
            <button className="eye-btn" onClick={() => setShowPwd(v => !v)} type="button">
              <EyeIcon />
            </button>
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => navigate('discover')}>
              Login <ArrowRight />
            </button>
            <button className="btn btn-dark" onClick={() => navigate('register')}>
              Register
            </button>
          </div>

          <div className="login-footer">
            By logging in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.<br />
            Unauthorized access is prohibited.
          </div>
        </div>
        <div className="page-footer">© 2023 Enterprise Corp. All rights reserved.</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   REGISTER VIEW
══════════════════════════════════════════ */
function RegisterView({ navigate }) {
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [strength, setStrength]     = useState({ pct: '0%', bg: '', label: '' })
  const [matchErr, setMatchErr]     = useState(false)
  const [usernameOk, setUsernameOk] = useState(false)
  const [confirmOk, setConfirmOk]   = useState(false)

  const LEVELS = [
    { pct: '25%', bg: '#EF4444', label: 'Weak' },
    { pct: '50%', bg: '#F59E0B', label: 'Fair' },
    { pct: '75%', bg: '#3B82F6', label: 'Good' },
    { pct: '100%', bg: '#22C55E', label: 'Strong' },
  ]

  const handlePassword = (val) => {
    setPassword(val)
    let score = 0
    if (val.length >= 8) score++
    if (/[A-Z]/.test(val)) score++
    if (/[0-9]/.test(val)) score++
    if (/[^A-Za-z0-9]/.test(val)) score++
    const lvl = val.length ? LEVELS[Math.max(0, score - 1)] : { pct: '0%', bg: '', label: '' }
    setStrength(lvl)
    validateConfirm(confirm, val)
  }

  const validateConfirm = (cf, pw) => {
    if (!cf) { setMatchErr(false); setConfirmOk(false); return }
    if (cf === pw) { setMatchErr(false); setConfirmOk(true) }
    else           { setMatchErr(true);  setConfirmOk(false) }
  }

  const doSignUp = () => {
    if (!username.trim()) return
    if (!password)        return
    if (password !== confirm) { setMatchErr(true); return }
    navigate('onboard')
  }

  return (
    <div className="page-register">
      <div className="reg-wrap">
        <div className="reg-icon">
          <AddUserIcon />
        </div>
        <h1>Create Your Account</h1>
        <p>Join thousands of B2B businesses finding their perfect partners</p>

        <div className="reg-card">
          {/* Username */}
          <div className="field-label">Username</div>
          <div className="input-wrap" style={{ marginBottom: 20 }}>
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              className={usernameOk ? 'input-success' : ''}
              onChange={e => {
                setUsername(e.target.value)
                setUsernameOk(e.target.value.trim().length >= 3)
              }}
            />
          </div>

          {/* Password */}
          <div className="field-label">Password</div>
          <div className="input-wrap" style={{ marginBottom: 6 }}>
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={e => handlePassword(e.target.value)}
            />
            <button className="eye-btn" onClick={() => setShowPwd(v => !v)} type="button"><EyeIcon /></button>
          </div>
          <div className={`strength-bar-wrap${password.length ? ' active' : ''}`}>
            <div className="strength-bar" style={{ width: strength.pct, background: strength.bg }} />
          </div>
          <div className="strength-label">{strength.label}</div>

          {/* Confirm */}
          <div className="field-label" style={{ marginTop: 16 }}>Confirm Password</div>
          <div className="input-wrap" style={{ marginBottom: 4 }}>
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirm}
              className={confirmOk ? 'input-success' : ''}
              onChange={e => { setConfirm(e.target.value); validateConfirm(e.target.value, password) }}
            />
            <button className="eye-btn" onClick={() => setShowConf(v => !v)} type="button"><EyeIcon /></button>
          </div>
          <div className={`match-error${matchErr ? ' show' : ''}`}>⚠ Passwords do not match.</div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={doSignUp}>
            Create Account <ArrowRight />
          </button>

          <div className="login-footer" style={{ marginTop: 20 }}>
            Already have an account?{' '}
            <a href="#" onClick={e => { e.preventDefault(); navigate('login') }}>Sign in</a>
          </div>
        </div>

        <button className="back-link" onClick={() => navigate('login')}>
          <ArrowLeft /> Back to Login
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   EXPORT – switches between login / register
══════════════════════════════════════════ */
export default function Login({ navigate, initialView = 'login' }) {
  return initialView === 'register'
    ? <RegisterView navigate={navigate} />
    : <LoginView    navigate={navigate} />
}
