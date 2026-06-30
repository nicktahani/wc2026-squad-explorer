const POSITION_GROUPS = [
  { key: 'goalkeeper', label: 'Goalkeeper' },
  { key: 'defender', label: 'Defenders' },
  { key: 'midfielder', label: 'Midfielders' },
  { key: 'attacker', label: 'Attack' },
]

function getPositionGroup(player) {
  const position = `${player.positionName} ${player.positionAbbr}`.toLowerCase()

  if (/\b(gk|goalkeeper)\b/.test(position)) return 'goalkeeper'
  if (/\b(d|def|defender|centre back|center back|left back|right back|fullback|wingback)\b/.test(position)) return 'defender'
  if (/\b(m|mid|midfielder)\b/.test(position)) return 'midfielder'
  if (/\b(f|fw|forward|striker|attacker|winger)\b/.test(position)) return 'attacker'

  return 'midfielder'
}

function groupStarters(starters = []) {
  const grouped = Object.fromEntries(POSITION_GROUPS.map(group => [group.key, []]))

  starters.forEach(player => {
    grouped[getPositionGroup(player)].push(player)
  })

  return grouped
}

function hasPlayers(team) {
  return (team?.starters?.length ?? 0) > 0 || (team?.subs?.length ?? 0) > 0
}

function PlayerRow({ player, compact = false }) {
  return (
    <li className={`lineup-player${compact ? ' lineup-player--compact' : ''}`}>
      <span className="lineup-player__avatar" aria-hidden="true">
        {player.positionAbbr || '•'}
      </span>
      <span className="lineup-player__number">{player.jersey || '-'}</span>
      <span className="lineup-player__name">{player.name}</span>
      {compact && player.positionAbbr && (
        <span className="lineup-player__position">{player.positionAbbr}</span>
      )}
    </li>
  )
}

function TeamHeader({ team, fallbackCode, flag }) {
  const teamCode = team.abbreviation || fallbackCode || team.displayName

  return (
    <h2 className="lineup-team__name">
      {flag && <span className="lineup-team__flag">{flag}</span>}
      <span>
        {teamCode}
        {team.formation && (
          <span className="lineup-team__formation"> ({team.formation})</span>
        )}
      </span>
    </h2>
  )
}

function TeamGroup({ players = [], label, align = 'left' }) {
  if (players.length === 0) return null

  return (
    <section className={`lineup-group lineup-group--${align}`}>
      <h3 className="lineup-group__title">{label}</h3>
      <ul className="lineup-group__players">
        {players.map(player => (
          <PlayerRow key={`${player.jersey}-${player.name}`} player={player} />
        ))}
      </ul>
    </section>
  )
}

function TeamSubs({ team, align = 'left' }) {
  if (!team.subs?.length) return null

  return (
    <section className={`lineup-subs lineup-subs--${align}`}>
      <ul className="lineup-subs__players">
        {team.subs.map(player => (
          <PlayerRow
            key={`${player.jersey}-${player.name}`}
            player={player}
            compact
          />
        ))}
      </ul>
    </section>
  )
}

export default function MatchLineup({ lineup, match }) {
  if (!hasPlayers(lineup.home) && !hasPlayers(lineup.away)) {
    return (
      <div className="lineup-placeholder">
        Lineup will appear here shortly before kickoff.
      </div>
    )
  }

  const homeGroups = groupStarters(lineup.home.starters)
  const awayGroups = groupStarters(lineup.away.starters)

  return (
    <>
      <div className="match-lineups__grid match-lineups__grid--desktop">
        <TeamHeader team={lineup.home} fallbackCode={match.team1Code} flag={match.team1Flag} />
        <TeamHeader
          team={lineup.away}
          fallbackCode={match.team2Code}
          flag={match.team2Flag}
        />

        {POSITION_GROUPS.map(group => (
          <div className="lineup-pair" key={group.key}>
            <TeamGroup players={homeGroups[group.key]} label={group.label} />
            <TeamGroup players={awayGroups[group.key]} label={group.label} align="right" />
          </div>
        ))}

        <div className="lineup-pair lineup-pair--subs">
          <h2 className="lineup-subs-heading">Substitutes</h2>
          <TeamSubs team={lineup.home} />
          <TeamSubs team={lineup.away} align="right" />
        </div>
      </div>

      <div className="match-lineups__mobile">
        <section className="lineup-team-section">
          <TeamHeader team={lineup.home} fallbackCode={match.team1Code} flag={match.team1Flag} />
          {POSITION_GROUPS.map(group => (
            <TeamGroup
              key={group.key}
              players={homeGroups[group.key]}
              label={group.label}
            />
          ))}
          <h2 className="lineup-subs-heading">Substitutes</h2>
          <TeamSubs team={lineup.home} />
        </section>

        <section className="lineup-team-section">
          <TeamHeader team={lineup.away} fallbackCode={match.team2Code} flag={match.team2Flag} />
          {POSITION_GROUPS.map(group => (
            <TeamGroup
              key={group.key}
              players={awayGroups[group.key]}
              label={group.label}
            />
          ))}
          <h2 className="lineup-subs-heading">Substitutes</h2>
          <TeamSubs team={lineup.away} />
        </section>
      </div>
    </>
  )
}
