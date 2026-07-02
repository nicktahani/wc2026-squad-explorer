import { Link } from 'react-router-dom'
import '../styles/MatchCard.css'
import { formatDate } from '../utils/date'

export default function MatchCard({ match }) {
  const { 
    team1, 
    team2, 
    team1Code, 
    team2Code, 
    team1Flag, 
    team2Flag, 
    date, 
    score, 
    round 
  } = match
  const ft = score?.ft
  const et = score?.et
  const penalties = score?.p

  return (
    <Link to={`/match/${match.id}`} className="match-card">
      <div className="match-card__row">
        <span className="match-card__team">
          {team1Code ? `${team1Flag} ${team1Code}` : team1}
        </span>
        <div className="match-card__center">
          {ft ? (
            <>
              <span className="match-card__score">
                {et ? `${et[0]}-${et[1]}` : `${ft[0]}-${ft[1]}`}
                {et && !penalties && (
                  <span className="match-card__score-note"> (ET)</span>
                )}
              </span>
              {penalties && (
                <span className="match-card__penalties">
                  Pens {penalties[0]}–{penalties[1]}
                </span>
              )}
            </>
          ) : (
            <span className="match-card__vs">vs</span>
          )}
        </div>
        <span className="match-card__team match-card__team--right">
          {team2Code ? `${team2Flag} ${team2Code}` : team2}
        </span>
      </div>
      <div className="match-card__meta">
        <span className="match-card__meta-line1">
          {round && <>{round} · </>}
          {formatDate(date)}
        </span>
      </div>
    </Link>
  )
}
