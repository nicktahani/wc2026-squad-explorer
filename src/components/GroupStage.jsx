import '../styles/GroupStage.css'
import MatchCard from './MatchCard'

export default function GroupStage({ groups, matches, teamsByName }) {
  const matchesByGroup = new Map()
  for (const match of matches) {
    if (!matchesByGroup.has(match.group)) matchesByGroup.set(match.group, [])
    matchesByGroup.get(match.group).push(match)
  }

  console.log('matchesByGroup', matchesByGroup)

  return (
    <div className="group-stage">
      {groups.map(group => {
        const groupMatches = matchesByGroup.get(group.name) ?? []
        return (
          <section key={group.name} className="group-section">
            <header className="group-section__header">
              <h2 className="group-section__title">{group.name}</h2>
              <ul className="group-section__teams">
                {group.teamNames.map(name => {
                  const team = teamsByName.get(name)
                  return (
                    <li key={name} className="group-section__team">
                      {team?.flag && (
                        <span className="group-section__flag" aria-hidden="true">
                          {team.flag}
                        </span>
                      )}
                      <span>{team?.displayName ?? name}</span>
                    </li>
                  )
                })}
              </ul>
            </header>
            <div className="group-section__matches">
              {groupMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
              {groupMatches.length === 0 && (
                <p className="group-section__empty">No matches scheduled</p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
