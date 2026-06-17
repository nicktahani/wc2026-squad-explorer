import './App.css'
import { useWorldCupData } from './data/useWorldCupData'

export default function App() {
  const { data, loading, error, reload } = useWorldCupData()

  console.log('data', data)

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">⚽</span>
          <div>
            <h1 className="app__title">World Cup 2026 Squad Explorer</h1>
            <p className="app__subtitle">
              Click through matchups and size up each team by their players&apos; clubs
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
      </main>

      <footer className="app__footer">
        <span>Data: openfootball (public domain)</span>
      </footer>
    </div>
  )
}
