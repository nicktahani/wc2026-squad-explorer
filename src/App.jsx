import './App.css'
import { Routes, Route } from 'react-router-dom'
import { useWorldCupData } from './data/useWorldCupData'
import GroupStage from './components/GroupStage'
import KnockoutStage from './components/KnockoutStage'
import MatchView from './components/MatchView'

export default function App() {
  const { data, loading, error, reload } = useWorldCupData()

  return (
    <div className="app">
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
        <span>Data: openfootball (public domain)</span>
      </footer>
    </div>
  )
}
