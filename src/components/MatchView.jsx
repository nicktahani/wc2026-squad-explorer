import { useParams, Link } from 'react-router-dom'
import '../styles/MatchView.css'
import { formatDate } from '../utils/date'
import { useMatchLineup } from '../data/useMatchLineup'
import MatchLineup from './MatchLineup'

export default function MatchView({ data }) {
  const { id } = useParams()

  const match = data.matches.find(m => m.id === id)
  const { lineup, status } = useMatchLineup(match)

  if (!match) return <p className="status">Match not found.</p>

  const ft = match.score?.ft
  const et = match.score?.et
  const penalties = match.score?.p

  return (
    <div className="match-view">
      <Link to="/" className="match-view__back">← All matches</Link>

      <header className="match-view__header">
        <div className="match-view__team-block">
          {match.team1Flag && <span className="match-view__flag">{match.team1Flag}</span>}
          <span className="match-view__team-name">{match.team1 ?? match.team1Code}</span>
        </div>

        <div className="match-view__center">
          {ft ? (
            <>
              <span className="match-view__score">
                {ft[0]}–{ft[1]}
                {et && !penalties && <span className="match-view__score-note"> (ET)</span>}
              </span>
              {penalties && (
                <span className="match-view__penalties">
                  Pens {penalties[0]}–{penalties[1]}
                </span>
              )}
            </>
          ) : (
            <span className="match-view__vs">vs</span>
          )}
        </div>

        <div className="match-view__team-block">
          {match.team2Flag && <span className="match-view__flag">{match.team2Flag}</span>}
          <span className="match-view__team-name">{match.team2 ?? match.team2Code}</span>
        </div>

        <div className="match-view__details">
          <div className="match-view__meta">
            {match.group && <span>{match.group}</span>}
            {match.round && <span>{match.round}</span>}
            {match.date && <span>{formatDate(match.date)}</span>}
            {match.time && <span>{match.time}</span>}
          </div>
          {match.ground && <div className="match-view__ground">{match.ground}</div>}
        </div>
      </header>

      <section className="match-lineups" aria-label="Starting lineups">
        <div className="match-lineups__heading">
          <h2>Starting Lineup</h2>
          {status === 'loading' && <span>Loading lineup…</span>}
          {status === 'unavailable' && <span>Lineup unavailable for this match.</span>}
          {status === 'error' && <span>Couldn't load lineup.</span>}
        </div>

        {status === 'ready' && (
          <MatchLineup lineup={lineup} match={match} />
        )}
      </section>
    </div>
  )
}
