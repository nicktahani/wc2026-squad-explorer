import { useParams, Link } from 'react-router-dom'
import '../styles/MatchView.css'
import { formatDate } from '../utils/date'

function groupByClub(players) {
  const map = new Map()
  for (const player of players) {
    if (!map.has(player.club)) map.set(player.club, [])
    map.get(player.club).push(player)
  }
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([club, players]) => ({ club, players }))
}

function RosterColumn({ name, flag, players }) {
  const clubs = groupByClub(players)

  return (
    <div className="roster">
      <h2 className="roster__heading">
        {flag && <span className="roster__flag">{flag}</span>}
        <span>{name}</span>
        <span className="roster__player-count">{players.length} players</span>
      </h2>

      {clubs.length === 0 ? (
        <p className="roster__empty">No squad data available</p>
      ) : (
        clubs.map(({ club, players: clubPlayers }) => (
          <div key={club} className="roster__club">
            <div className="roster__club-header">
              <span className="roster__club-name">{club}</span>
              <span className="roster__club-count">{clubPlayers.length}</span>
            </div>
            <ul className="roster__players">
              {clubPlayers.map(p => (
                <li key={p.name} className="roster__player">
                  <span className="roster__pos">{p.position}</span>
                  <span className="roster__name">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}

export default function MatchView({ data }) {
  const { id } = useParams()

  const match = data.matches.find(m => m.id === id)
  if (!match) return <p className="status">Match not found.</p>

  const team1 = data.teamsByName.get(match.team1)
  const team2 = data.teamsByName.get(match.team2)
  const ft = match.score?.ft

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

      <div className="match-view__rosters">
        <RosterColumn
          name={match.team1Code ?? match.team1}
          flag={match.team1Flag}
          players={team1?.players ?? []}
        />
        <RosterColumn
          name={match.team2Code ?? match.team2}
          flag={match.team2Flag}
          players={team2?.players ?? []}
        />
      </div>
    </div>
  )
}
