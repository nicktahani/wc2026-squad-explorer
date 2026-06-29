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

function TeamHeader({ team, fallbackName, flag, align = 'left' }) {
  return (
    <h2 className={`lineup-team__name lineup-team__name--${align}`}>
      {align === 'left' && flag && <span className="lineup-team__flag">{flag}</span>}
      <span>{team.displayName || fallbackName}</span>
      {align === 'right' && flag && <span className="lineup-team__flag">{flag}</span>}
    </h2>
  )
}

function TeamGroup({ players = [], label, align = 'left' }) {
  return (
    <section className={`lineup-group lineup-group--${align}`}>
      <h3 className="lineup-group__title">{label}</h3>
      {players.length > 0 ? (
        <ul className="lineup-group__players">
          {players.map(player => (
            <PlayerRow key={`${player.jersey}-${player.name}`} player={player} />
          ))}
        </ul>
      ) : (
        <p className="lineup-status">No players listed.</p>
      )}
    </section>
  )
}

function TeamSubs({ team, align = 'left' }) {
  return (
    <section className={`lineup-subs lineup-subs--${align}`}>
      <h3 className="lineup-subs__title">Substitutes</h3>
      {team.subs?.length > 0 ? (
        <ul className="lineup-subs__players">
          {team.subs.map(player => (
            <PlayerRow
              key={`${player.jersey}-${player.name}`}
              player={player}
              compact
            />
          ))}
        </ul>
      ) : (
        <p className="lineup-status">No substitutes listed.</p>
      )}
    </section>
  )
}

export default function MatchLineup({ lineup, match }) {
  const homeGroups = groupStarters(lineup.home.starters)
  const awayGroups = groupStarters(lineup.away.starters)

  return (
    <>
      <div className="match-lineups__grid match-lineups__grid--desktop">
        <TeamHeader team={lineup.home} fallbackName={match.team1} flag={match.team1Flag} />
        <TeamHeader
          team={lineup.away}
          fallbackName={match.team2}
          flag={match.team2Flag}
          align="right"
        />

        {POSITION_GROUPS.map(group => (
          <div className="lineup-pair" key={group.key}>
            <TeamGroup players={homeGroups[group.key]} label={group.label} />
            <TeamGroup players={awayGroups[group.key]} label={group.label} align="right" />
          </div>
        ))}

        <div className="lineup-pair lineup-pair--subs">
          <TeamSubs team={lineup.home} />
          <TeamSubs team={lineup.away} align="right" />
        </div>
      </div>

      <div className="match-lineups__mobile">
        <section className="lineup-team-section">
          <TeamHeader team={lineup.home} fallbackName={match.team1} flag={match.team1Flag} />
          {POSITION_GROUPS.map(group => (
            <TeamGroup
              key={group.key}
              players={homeGroups[group.key]}
              label={group.label}
            />
          ))}
          <TeamSubs team={lineup.home} />
        </section>

        <section className="lineup-team-section">
          <TeamHeader team={lineup.away} fallbackName={match.team2} flag={match.team2Flag} />
          {POSITION_GROUPS.map(group => (
            <TeamGroup
              key={group.key}
              players={awayGroups[group.key]}
              label={group.label}
            />
          ))}
          <TeamSubs team={lineup.away} />
        </section>
      </div>
    </>
  )
}
