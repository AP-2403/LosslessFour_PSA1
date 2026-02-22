/* Help.jsx */
import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

const FAQS = [
  { q: 'How does NexaTrade match businesses?', a: 'Our AI engine analyses your industry, product catalogues, capacity, certifications, and trade regions to surface the most relevant partners. Scores update daily as profiles are enriched.' },
  { q: 'Can I control who can see my profile?', a: 'Yes. Go to Settings → Security → Public Profile Visibility. When off, only businesses you directly match with can view your profile details.' },
  { q: 'How do I respond to an inquiry?', a: 'Open the Inquiries page, click any thread, and use the reply box at the bottom. Your response is delivered instantly and tracked in the thread history.' },
  { q: 'What certifications are supported?', a: 'We support ISO 9001, ISO 14001, FSSAI, BIS, MSME, DGFT, CE, FDA, Halal, Kosher, and many more. Missing one? Contact support to have it added.' },
  { q: 'How do Saved Lists work?', a: 'Saved Lists let you bookmark and organise companies for follow-up. Click "Create New List" on the Saved Lists page, give it a name and category, then add companies from Discovery or your Matches.' },
  { q: 'Is my trade data shared with third parties?', a: 'Never. Your data is used solely to power your matchmaking results within NexaTrade. We are GDPR and DPDP (India) compliant.' },
  { q: 'How do I upgrade my plan?', a: 'Click your profile photo → Billing, or contact our sales team at sales@nexatrade.in. Enterprise plans include advanced analytics, API access, and a dedicated account manager.' },
]

export default function Help({ navigate }) {
  const [open, setOpen] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !msg.trim()) return
    setSent(true)
  }

  return (
    <div className="page-discover">
      <Sidebar activeItem="help" navigate={navigate} />
      <div className="main-area">
        <Topbar placeholder="Search help..." userName="Arjun Mehta" userRole="Senior Trade Analyst" avatarText="AM" navigate={navigate} />
        <div className="content">
          <h2 style={{ marginBottom:6 }}>Help Center</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:32 }}>Find answers, tutorials, and reach our support team.</p>

          {/* Quick tiles */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:32 }}>
            {[
              { icon:'📖', title:'Documentation', desc:'Step-by-step guides and API reference' },
              { icon:'🎥', title:'Video Tutorials', desc:'Walk-throughs for every feature' },
              { icon:'💬', title:'Live Chat', desc:'Talk to support Mon–Fri 9am–6pm IST' },
            ].map(t => (
              <div key={t.title} style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'20px 18px', cursor:'pointer', transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--glass-border)'}>
                <div style={{ fontSize:28, marginBottom:10 }}>{t.icon}</div>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t.title}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.desc}</div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'24px 28px', marginBottom:24 }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Frequently Asked Questions</h3>
            {FAQS.map((f, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length-1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div onClick={() => setOpen(open === i ? null : i)}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', cursor:'pointer' }}>
                  <span style={{ fontSize:14, fontWeight:600, color: open===i ? 'var(--accent)' : 'rgba(255,255,255,0.9)' }}>{f.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink:0, transform: open===i ? 'rotate(180deg)' : 'none', transition:'transform 0.25s', color: open===i ? 'var(--accent)' : 'var(--text-muted)' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {open === i && (
                  <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, paddingBottom:14 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div style={{ background:'var(--panel)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius)', padding:'24px 28px' }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Contact Support</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Didn't find your answer? Our team typically replies within 4 hours.</p>
            {sent ? (
              <div style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Message Sent!</div>
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>We'll get back to you at {email} within 4 hours.</div>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Your Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Arjun Mehta"
                      style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:14, outline:'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Email Address</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="arjun@company.com" type="email"
                      style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:14, outline:'none' }} />
                  </div>
                </div>
                <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Message</label>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Describe your issue or question..."
                  style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none', minHeight:110, resize:'vertical', marginBottom:16 }} />
                <button className="btn btn-primary" onClick={handleSend}>Send Message</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}