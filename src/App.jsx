import { useState } from 'react'
import Login from './components/Login.jsx'
import Onboarding from './components/Onboarding.jsx'
import DiscoveryCards from './components/DiscoveryCards.jsx'
import Matches from './components/Matches.jsx'
import './App.css'

const DEV_PAGES = ['login', 'register', 'onboard', 'discover', 'matches']

function App() {
  const [currentPage, setCurrentPage] = useState('login')

  // Shared state: companies swiped right in Discovery accumulate here
  const [discoveredMatches, setDiscoveredMatches] = useState([])

  const navigate = (page) => setCurrentPage(page)

  // Passed to DiscoveryCards — called when user clicks the blue ✓ tick
  const handleMatch = (newMatch) => {
    setDiscoveredMatches(prev => [newMatch, ...prev])
  }

  return (
    <div className="app-root">
      {/* ── DEV NAV ── */}
      <nav id="dev-nav">
        {DEV_PAGES.map((p) => (
          <button
            key={p}
            className={currentPage === p ? 'active' : ''}
            onClick={() => navigate(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </nav>

      {/* ── PAGES ── */}
      {(currentPage === 'login' || currentPage === 'register') && (
        <Login navigate={navigate} initialView={currentPage} />
      )}
      {currentPage === 'onboard' && <Onboarding navigate={navigate} />}
      {currentPage === 'discover' && (
        <DiscoveryCards navigate={navigate} onMatch={handleMatch} />
      )}
      {currentPage === 'matches' && (
        <Matches navigate={navigate} extraMatches={discoveredMatches} />
      )}
    </div>
  )
}

export default App