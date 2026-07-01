import teamSupplemental from './teamSupplemental.json'

// handles diacritics, ampersands, and other non-alphanumeric characters
function normalizeNameKey(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const supplementalByName = new Map(
  Object.entries(teamSupplemental).map(([name, info]) => [normalizeNameKey(name), info])
)

function getSupplementalTeamInfo(team) {
  return (
    supplementalByName.get(normalizeNameKey(team.name)) ||
    supplementalByName.get(normalizeNameKey(team.name_normalised)) ||
    null
  )
}

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
  const round = slug(match.round) || 'match'
  const team1 = slug(match.team1) || 'tbd'
  const team2 = slug(match.team2) || 'tbd'
  return `${match.date ?? 'tbd'}-${round}-${team1}-vs-${team2}-${index}`
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
    const supplemental = getSupplementalTeamInfo(team)

    return {
      name: team.name,
      displayName: team.name_normalised || team.name,
      fifaCode: team.fifa_code,
      fifa_ranking: supplemental?.fifa_ranking ?? null,
      star_player: supplemental?.star_player ?? null,
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
  const normalizedMatches = matchList.map((match, index) => {
    const stage = match.group ? 'group' : 'knockout'
    return {
      id: makeMatchId(match, index),
      stage,
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
    }
  })

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
