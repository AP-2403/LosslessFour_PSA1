/* Settings.jsx */
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

const TOGGLE = ({ on, onChange, label }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
    <span style={{ fontSize:14, color:'rgba(255,255,255,0.85)' }}>{label}</span>
    <div onClick={onChange} style={{ width:44, height:24, borderRadius:12, background: on ? 'var(--accent)' : 'rgba(255,255,255,0.15)', cursor:'pointer', position:'relative', transition:'background 0.25s' }}>
      <div style={{ position:'absolute', top:3, left: on ? 22 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
    </div>
  </div>
)

export default function Settings({ navigate }) {
  const [notifEmail,    setNotifEmail]    = useState(true)
  const [notifInquiry,  setNotifInquiry]  = useState(true)
  const [notifMatch,    setNotifMatch]    = useState(true)
  const [notifWeekly,   setNotifWeekly]   = useState(false)
  const [twoFA,         setTwoFA]         = useState(false)
  const [publicProfile, setPublicProfile] = useState(true)
  const [darkMode,      setDarkMode]      = useState(true)
  const [compactView,   setCompactView]   = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [showChange,    setShowChange]    = useState(false)
  const [curPwd,        setCurPwd]        = useState('')
  const [newPwd,        setNewPwd]        = useState('')
  const [confirmPwd,    setConfirmPwd]    = useState('')
  const [pwdError,      setPwdError]      = useState('')
  const [pwdSuccess,    setPwdSuccess]    = useState('')

  // demo: store a mock password in localStorage (only for UI demo)
  const PWD_KEY = 'nexa_mock_password'
  useEffect(() => {
    try {
      if (!localStorage.getItem(PWD_KEY)) localStorage.setItem(PWD_KEY, 'password123')
    } catch (e) {}
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const S = {
    section: { background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'24px 28px', marginBottom:20 },
    sectionTitle: { fontSize:15, fontWeight:700, color:'var(--white)', marginBottom:4, display:'flex', alignItems:'center', gap:10 },
    sectionSub:   { fontSize:12, color:'var(--text-muted)', marginBottom:16 },
    input: { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:14, outline:'none', marginBottom:14 },
    label: { fontSize:12, color:'var(--text-muted)', marginBottom:6, display:'block', fontWeight:500 },
  }

  return (
    <div className="page-discover">
      <Sidebar activeItem="settings" navigate={navigate} />
      <div className="main-area">
        <Topbar placeholder="Search settings..." userName="Arjun Mehta" userRole="Senior Trade Analyst" avatarText="AM" navigate={navigate} />
        <div className="content">
          <div style={{ maxWidth:720 }}>
            <h2 style={{ marginBottom:6 }}>Settings</h2>
            <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:28 }}>Manage your account preferences, security, and notifications.</p>

            {/* Account */}
            <div style={S.section}>
              <div style={S.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Account Details
              </div>
              <div style={S.sectionSub}>Your personal information visible to matched partners</div>
              <label style={S.label}>Full Name</label>
              <input style={S.input} defaultValue="Arjun Mehta" />
              <label style={S.label}>Work Email</label>
              <input style={S.input} defaultValue="arjun.mehta@nexatrade.in" type="email" />
              <label style={S.label}>Company</label>
              <input style={S.input} defaultValue="Mehta Global Exports Pvt. Ltd." />
              <label style={S.label}>Role / Title</label>
              <input style={S.input} defaultValue="Senior Trade Analyst" />
            </div>

            {/* Security */}
            <div style={S.section}>
              <div style={S.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Security
              </div>
              <div style={S.sectionSub}>Protect your account</div>
              <TOGGLE label="Two-Factor Authentication (2FA)" on={twoFA} onChange={() => setTwoFA(v => !v)} />
              <TOGGLE label="Public Profile Visibility" on={publicProfile} onChange={() => setPublicProfile(v => !v)} />
              <button className="btn btn-dark" style={{ marginTop:16 }} onClick={() => { setShowChange(v => !v); setPwdError(''); setPwdSuccess('') }}>Change Password</button>

              {showChange && (
                <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                  <label style={S.label}>Current Password</label>
                  <input style={S.input} type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} />

                  <label style={S.label}>New Password</label>
                  <input style={S.input} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />

                  <label style={S.label}>Confirm New Password</label>
                  <input style={S.input} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />

                  {pwdError && <div style={{ color:'var(--red)', fontSize:13, marginBottom:8 }}>{pwdError}</div>}
                  {pwdSuccess && <div style={{ color:'var(--green)', fontSize:13, marginBottom:8 }}>{pwdSuccess}</div>}

                  <div style={{ display:'flex', gap:10 }}>
                    <button className="btn btn-primary" onClick={() => {
                      setPwdError('')
                      setPwdSuccess('')
                      // validate
                      try {
                        const stored = localStorage.getItem(PWD_KEY) || ''
                        if (!curPwd) { setPwdError('Enter current password'); return }
                        if (curPwd !== stored) { setPwdError('Current password is incorrect'); return }
                        if (!newPwd || newPwd.length < 8) { setPwdError('New password must be at least 8 characters'); return }
                        if (newPwd !== confirmPwd) { setPwdError('New passwords do not match'); return }
                        localStorage.setItem(PWD_KEY, newPwd)
                        setPwdSuccess('Password changed successfully')
                        setCurPwd(''); setNewPwd(''); setConfirmPwd('')
                        setTimeout(() => setShowChange(false), 900)
                      } catch (e) { setPwdError('Unable to update password') }
                    }}>Save Password</button>
                    <button className="btn btn-dark" onClick={() => { setShowChange(false); setPwdError(''); setPwdSuccess('') }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div style={S.section}>
              <div style={S.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Notifications
              </div>
              <div style={S.sectionSub}>Choose what updates you receive</div>
              <TOGGLE label="Email Notifications" on={notifEmail} onChange={() => setNotifEmail(v => !v)} />
              <TOGGLE label="Inquiry Alerts"       on={notifInquiry} onChange={() => setNotifInquiry(v => !v)} />
              <TOGGLE label="New Match Alerts"     on={notifMatch}   onChange={() => setNotifMatch(v => !v)} />
              <TOGGLE label="Weekly Summary Digest" on={notifWeekly} onChange={() => setNotifWeekly(v => !v)} />
            </div>

            {/* Appearance */}
            <div style={S.section}>
              <div style={S.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                Appearance
              </div>
              <div style={S.sectionSub}>Visual preferences</div>
              <TOGGLE label="Dark Mode"      on={darkMode}      onChange={() => setDarkMode(v => !v)} />
              <TOGGLE label="Compact View"   on={compactView}   onChange={() => setCompactView(v => !v)} />
            </div>

            <button
              className="btn btn-primary"
              style={{ width:200 }}
              onClick={handleSave}
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}