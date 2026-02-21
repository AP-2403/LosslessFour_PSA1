/* Topbar.jsx
   Props:
     placeholder  – search input placeholder text
     userName     – display name
     userRole     – role string
     avatarText   – 2-char avatar initials
     avatarStyle  – inline style object for avatar gradient
*/
export default function Topbar({
  placeholder = 'Search...',
  userName    = 'John Doe',
  userRole    = 'Senior Analyst',
  avatarText  = 'JD',
  avatarStyle = {},
}) {
  return (
    <div className="topbar">
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder={placeholder} />
      </div>

      <div className="topbar-right">
        <div className="user-chip">
          <div className="info">
            <div className="name">{userName}</div>
            <div className="role">{userRole}</div>
          </div>
          <div className="avatar-sm" style={avatarStyle}>{avatarText}</div>
        </div>
      </div>
    </div>
  )
}
