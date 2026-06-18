function normalizePlayer(raw) {
  return {
    number: raw.number,
    name: raw.name,
    position: raw.pos,
    dateOfBirth: raw.date_of_birth,
    club: raw.club.name,
  }
}

function makeMatchId(match, index) {
  const slug = s =>
    String(s ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  return `${match.date ?? 'tbd'}-${slug(match.team1)}-vs-${slug(match.team2)}-${index}`
}

function matchStatus(match) {
  return match?.score?.ft ? 'finished' : 'scheduled'
}

export function normalizeWorldCup({ teams = [], groups = [], matches = [], squads = [] }) {
  const squadByName = new Map()
  for (const squad of squads) {
    squadByName.set(squad.name, squad)
    if (squad.fifa_code) squadByName.set(squad.fifa_code, squad)
  }

  const normalizedTeams = teams.map(team => {
    const squad =
      squadByName.get(team.name) ||
      squadByName.get(team.name_normalised) ||
      squadByName.get(team.fifa_code)
    const players = (squad?.players ?? []).map(normalizePlayer)
    return {
      name: team.name,
      displayName: team.name_normalised || team.name,
      fifaCode: team.fifa_code,
      group: team.group,
      confederation: team.confed,
      continent: team.continent,
      flag: team.flag_icon,
      players,
      playerCount: players.length,
    }
  })

  const teamsByName = new Map(normalizedTeams.map(team => [team.name, team]))

  const normalizedGroups = (groups.groups ?? []).map(group => ({
    name: group.name,
    teamNames: group.teams ?? [],
  }))

  const matchList = Array.isArray(matches) ? matches : matches.matches ?? []
  const normalizedMatches = matchList.map((match, index) => ({
    id: makeMatchId(match, index),
    round: match.round,
    date: match.date,
    time: match.time,
    group: match.group,
    ground: match.ground,
    team1: match.team1,
    team2: match.team2,
    team1Code: teamsByName.get(match.team1)?.fifaCode ?? null,
    team2Code: teamsByName.get(match.team2)?.fifaCode ?? null,
    team1Flag: teamsByName.get(match.team1)?.flag ?? null,
    team2Flag: teamsByName.get(match.team2)?.flag ?? null,
    score: match.score,
    goals1: match.goals1 ?? [],
    goals2: match.goals2 ?? [],
    status: matchStatus(match),
  }))

  return {
    teams: normalizedTeams,
    teamsByName,
    groups: normalizedGroups,
    matches: normalizedMatches,
    meta: {
      tournament: 'World Cup 2026',
      teamCount: normalizedTeams.length,
      matchCount: normalizedMatches.length,
      playerCount: normalizedTeams.reduce((sum, t) => sum + t.playerCount, 0)
    },
  }
}

export function getTeam(data, nameOrCode) {
  return data?.teamsByName?.get(nameOrCode) ?? null
}
