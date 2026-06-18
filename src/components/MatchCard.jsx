import { Link } from 'react-router-dom'
import '../styles/MatchCard.css'

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MatchCard({ match }) {
  const { team1, team2, team1Code, team2Code, team1Flag, team2Flag, date, time, score, status, ground, round } = match
  const ft = score?.ft

  return (
    <Link to={`/match/${match.id}`} className={`match-card match-card--${status}`}>
      <div className="match-card__row">
        <span className="match-card__team">{team1Code ? `${team1Flag} ${team1Code}` : team1}</span>
        <div className="match-card__center">
          {ft ? (
            <span className="match-card__score">{ft[0]}–{ft[1]}</span>
          ) : (
            <span className="match-card__vs">vs</span>
          )}
        </div>
        <span className="match-card__team match-card__team--right">{team2Code ? `${team2Flag} ${team2Code}` : team2}</span>
      </div>
      <div className="match-card__meta">
        <span className="match-card__meta-line1">
          {round && <>{round} · </>}
          {formatDate(date)}
          {time && <>, {time}</>}
        </span>
        {ground && <span className="match-card__ground">{ground}</span>}
      </div>
    </Link>
  )
}
