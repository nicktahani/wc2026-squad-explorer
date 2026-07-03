import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faClock, faFutbol } from '@fortawesome/free-regular-svg-icons'
import { faMapPin } from '@fortawesome/free-solid-svg-icons'
import '../styles/MatchView.css'
import { formatDate } from '../utils/date'
import { getTeam } from '../data/normalize'
import { useMatchLineup } from '../data/useMatchLineup'
import MatchLineup from './MatchLineup'

function TeamSupplement({ team, align = 'left' }) {
  if (!team?.fifa_ranking && !team?.star_player) return null

  return (
    <section className={`match-view__team-supplement match-view__team-supplement--${align}`}>
      <div className="match-view__team-supplement-body">
        {team.fifa_ranking && (
          <div className="match-view__ranking">
            <span className="match-view__ranking-label">
              {team.flag && <span className="match-view__ranking-flag" aria-hidden="true">{team.flag}</span>}
              FIFA Ranking
            </span>
            <span className="match-view__ranking-number">#{team.fifa_ranking}</span>
          </div>
        )}
        {team.star_player && (
          <div className="match-view__star-player">
            <span className="match-view__star-player-label">Star Player</span>
            <span className="match-view__star-player-name">{team.star_player}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function formatGoalMinute(minute, isPenalty) {
  if (!minute) return isPenalty ? '(P)' : ''
  return `${minute}'${isPenalty ? ' (P)' : ''}`
}

function groupGoals(goals = []) {
  const groupedGoals = new Map()

  for (const goal of goals) {
    const name = goal.name?.trim()
    if (!name) continue

    const minutes = groupedGoals.get(name) ?? []
    minutes.push(formatGoalMinute(goal.minute, goal.penalty))
    groupedGoals.set(name, minutes)
  }

  return Array.from(groupedGoals, ([name, minutes]) => ({
    name,
    minutes: minutes.filter(Boolean),
  }))
}

function GoalScorers({ goals, align }) {
  const scorers = groupGoals(goals)

  if (scorers.length === 0) {
    return <div className={`match-view__goal-list match-view__goal-list--${align}`} aria-hidden="true" />
  }

  return (
    <div className={`match-view__goal-list match-view__goal-list--${align}`}>
      {scorers.map(scorer => (
        <div className="match-view__goal-scorer" key={scorer.name}>
          <span className="match-view__goal-name">{scorer.name}</span>
          {scorer.minutes.length > 0 && (
            <span className="match-view__goal-minutes"> {scorer.minutes.join(', ')}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function MatchView({ data }) {
  const { id } = useParams()

  const match = data.matches.find(m => m.id === id)
  const { lineup, status } = useMatchLineup(match)

  if (!match) return <p className="status">Match not found.</p>

  const ft = match.score?.ft
  const et = match.score?.et
  const penalties = match.score?.p
  const homeTeam = getTeam(data, match.team1)
  const awayTeam = getTeam(data, match.team2)
  const hasGoals = match.goals1.length > 0 || match.goals2.length > 0

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
                {et ? `${et[0]}-${et[1]}` : `${ft[0]}-${ft[1]}`}
                {et && !penalties && <span className="match-view__score-note"> (ET)</span>}
              </span>
              {penalties && (
                <span className="match-view__penalties">
                  Pens {penalties[0]}–{penalties[1]}
                </span>
              )}
              {hasGoals && (
                <div className="match-view__goals" aria-label="Goals">
                  <GoalScorers goals={match.goals1} align="left" />
                  <FontAwesomeIcon className="match-view__goal-ball" icon={faFutbol} aria-hidden="true" />
                  <GoalScorers goals={match.goals2} align="right" />
                </div>
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
            {match.date && (
              <span className="match-view__detail-item">
                <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                <span>{formatDate(match.date)}</span>
              </span>
            )}
            {match.time && (
              <span className="match-view__detail-item">
                <FontAwesomeIcon icon={faClock} aria-hidden="true" />
                <span>{match.time}</span>
              </span>
            )}
          </div>
          {match.ground && (
            <div className="match-view__ground match-view__detail-item">
              <FontAwesomeIcon icon={faMapPin} aria-hidden="true" />
              <span>{match.ground}</span>
            </div>
          )}
        </div>
      </header>

      {(homeTeam || awayTeam) && (
        <div className="match-view__supplements" aria-label="Team notes">
          <TeamSupplement team={homeTeam} />
          <TeamSupplement team={awayTeam} align="right" />
        </div>
      )}

      <section className="match-lineups" aria-label="Starting lineups">
        <div className="match-lineups__heading">
          <h2>Starting Lineups</h2>
          {status === 'loading' && <span>Loading lineup…</span>}
          {status === 'unavailable' && <span>Lineup unavailable for this match.</span>}
          {status === 'error' && <span>Couldn't load lineup.</span>}
        </div>

        {status === 'ready' && (
          <MatchLineup
            lineup={lineup}
            match={match}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}
      </section>
    </div>
  )
}
