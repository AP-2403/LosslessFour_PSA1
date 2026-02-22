/* Topbar.jsx */
export default function Topbar({
  placeholder = 'Search...',
  userName    = 'Arjun Mehta',
  userRole    = 'Senior Trade Analyst',
  avatarText  = 'AM',
  avatarStyle = {},
  navigate,
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
        <div
          className="user-chip"
          style={{ cursor: navigate ? 'pointer' : 'default' }}
          onClick={() => navigate && navigate('profile')}
          title="View Profile"
        >
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