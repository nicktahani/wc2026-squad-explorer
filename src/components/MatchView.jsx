import { useParams, Link } from 'react-router-dom'
import '../styles/MatchView.css'
import { formatDate } from '../utils/date'
import { useMatchLineup } from '../data/useMatchLineup'
import Pitch from './Pitch'

export default function MatchView({ data }) {
  const { id } = useParams()

  const match = data.matches.find(m => m.id === id)
  const { lineup, loading, available } = useMatchLineup(match)
  if (!match) return <p className="status">Match not found.</p>

  const ft = match.score?.ft

  // ESPN uses its own home/away which may differ from openfootball's team1/team2 order
  // match by abbreviation so the pitch always shows team1 at the bottom
  const team1Roster = lineup
    ? (lineup.home?.abbreviation === match.team1Code ? lineup.home : lineup.away)
    : null
  const team2Roster = lineup
    ? (lineup.home?.abbreviation === match.team1Code ? lineup.away : lineup.home)
    : null

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

      <Pitch homeRoster={team1Roster} awayRoster={team2Roster} />
    </div>
  )
}
