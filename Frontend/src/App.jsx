import { useState, useEffect } from 'react'
import Login         from './components/Login.jsx'
import Onboarding    from './components/Onboarding.jsx'
import DiscoveryCards from './components/DiscoveryCards.jsx'
import Matches       from './components/Matches.jsx'
import Inquiries     from './components/Inquiries.jsx'
import SavedLists    from './components/SavedLists.jsx'
import Analytics     from './components/Analytics.jsx'
import Profile       from './components/Profile.jsx'
import Settings      from './components/Settings.jsx'
import Help          from './components/Help.jsx'
import './App.css'

function App() {
  const [currentPage,       setCurrentPage]       = useState('login')
  const [discoveredMatches, setDiscoveredMatches] = useState([])
  const [userProfile, setUserProfile] = useState({ country: '' })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexa_user_profile')
      if (stored) setUserProfile(JSON.parse(stored))
    } catch (e) {}
  }, [])

  const updateUserProfile = (updater) => {
    setUserProfile(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      try { localStorage.setItem('nexa_user_profile', JSON.stringify(next)) } catch (e) {}
      return next
    })
  }

  const [onboardRequired, setOnboardRequired] = useState(false)
  const navigate    = (page, opts) => {
    setCurrentPage(page)
    setOnboardRequired(!!(opts && opts.requireComplete))
  }
  const handleMatch = (m)    => setDiscoveredMatches(prev => [m, ...prev])

  return (
    <div className="app-root">
      {(currentPage === 'login' || currentPage === 'register') && (
        <Login navigate={navigate} initialView={currentPage} />
      )}
      {currentPage === 'onboard'    && <Onboarding    navigate={navigate} requireComplete={onboardRequired} setUserProfile={updateUserProfile} />}
      {currentPage === 'discover'   && <DiscoveryCards navigate={navigate} onMatch={handleMatch} />}
      {currentPage === 'matches'    && <Matches        navigate={navigate} extraMatches={discoveredMatches} userProfile={userProfile} />}
      {currentPage === 'inquiries'  && <Inquiries      navigate={navigate} />}
      {currentPage === 'saved'      && <SavedLists     navigate={navigate} />}
      {currentPage === 'analytics'  && <Analytics      navigate={navigate} />}
      {currentPage === 'profile'    && <Profile        navigate={navigate} />}
      {currentPage === 'settings'   && <Settings       navigate={navigate} />}
      {currentPage === 'help'       && <Help           navigate={navigate} />}
    </div>
  )
}

export default App