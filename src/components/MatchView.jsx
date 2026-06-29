import { useParams, Link } from 'react-router-dom'
import '../styles/MatchView.css'
import { formatDate } from '../utils/date'
import { useMatchLineup } from '../data/useMatchLineup'
import MatchLineup from './MatchLineup'

export default function MatchView({ data }) {
  const { id } = useParams()

  const match = data.matches.find(m => m.id === id)
  const { lineup, loading, available, error } = useMatchLineup(match)

  if (!match) return <p className="status">Match not found.</p>

  const ft = match.score?.ft
  const hasLineups = lineup?.home && lineup?.away

  return (
    <div className="match-view">
      <Link to="/" className="match-view__back">← All groups</Link>

      <header className="match-view__header">
        <div className="match-view__team-block">
          {match.team1Flag && <span className="match-view__flag">{match.team1Flag}</span>}
          <span className="match-view__team-name">{match.team1Code ?? match.team1}</span>
        </div>

        <div className="match-view__center">
          {ft ? (
            <span className="match-view__score">{ft[0]}–{ft[1]}</span>
          ) : (
            <span className="match-view__vs">vs</span>
          )}
          <div className="match-view__meta">
            {match.group && <span>{match.group}</span>}
            {match.round && <span>{match.round}</span>}
            {match.date && <span>{formatDate(match.date)}</span>}
            {match.time && <span>{match.time}</span>}
          </div>
          {match.ground && <div className="match-view__ground">{match.ground}</div>}
        </div>

        <div className="match-view__team-block match-view__team-block--right">
          <span className="match-view__team-name">{match.team2Code ?? match.team2}</span>
          {match.team2Flag && <span className="match-view__flag">{match.team2Flag}</span>}
        </div>
      </header>

      <section className="match-lineups" aria-label="Starting lineups">
        <div className="match-lineups__heading">
          <h1>Starting Lineup</h1>
          {loading && <span>Loading lineup…</span>}
          {!loading && !available && <span>Lineup unavailable for this match.</span>}
          {!loading && available && error && <span>Couldn't load lineup.</span>}
        </div>

        {!loading && lineup && !hasLineups && (
          <p className="lineup-status">Lineup not available.</p>
        )}

        {!loading && hasLineups && (
          <MatchLineup lineup={lineup} match={match} />
        )}
      </section>
    </div>
  )
}
