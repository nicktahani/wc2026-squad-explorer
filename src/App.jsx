import './App.css'
import { useEffect, useMemo } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useWorldCupData } from './data/useWorldCupData'
import { getCurrentRoundTarget } from './data/currentRound'
import GroupStage from './components/GroupStage'
import KnockoutStage from './components/KnockoutStage'
import MatchView from './components/MatchView'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return null
}

export default function App() {
  const { data, loading, error, reload } = useWorldCupData()
  const location = useLocation()
  const currentRound = useMemo(
    () => getCurrentRoundTarget(data?.matches),
    [data?.matches]
  )

  function jumpToCurrentRound() {
    if (!currentRound) return

    const element = document.getElementById(currentRound.anchorId)
    if (!element) return

    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${currentRound.anchorId}`)
  }

  return (
    <div className="app">
      <ScrollToTop />

      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">⚽</span>
          <div>
            <h1 className="app__title">World Cup 2026 Squad Explorer</h1>
            <p className="app__subtitle">
              View how teams stack up head-to-head and assess their quality
            </p>
          </div>
        </div>
      </header>

      <main className="app__main">
        {loading && (
          <p className="status">Loading…</p>
        )}

        {error && !loading && (
          <div className="status status--error">
            <p>Couldn't load data: {error.message}</p>
            <button className="btn" onClick={reload}>
              Try again
            </button>
          </div>
        )}

        {location.pathname === '/' && currentRound && (
          <div className="app__home-actions">
            <button
              type="button"
              className="app__round-button"
              onClick={jumpToCurrentRound}
              aria-label={`Jump to ${currentRound.round}`}
              title={`Jump to ${currentRound.round}`}
            >
              <span>Current round</span>
            </button>
          </div>
        )}

        {data && (
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <KnockoutStage matches={data.matches} />
                  <GroupStage
                    groups={data.groups}
                    matches={data.matches}
                    teamsByName={data.teamsByName}
                  />
                </>
              }
            />
            <Route path="/match/:id" element={<MatchView data={data} />} />
          </Routes>
        )}
      </main>

      <footer className="app__footer">
        <span>Data:
          <a href="https://github.com/openfootball/worldcup" target="_blank" rel="noopener noreferrer">
            openfootball
          </a>
        </span>
      </footer>
    </div>
  )
}
