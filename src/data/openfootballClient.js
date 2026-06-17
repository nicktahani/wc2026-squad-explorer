const BASE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026'

export const SOURCE_FILES = {
  teams: 'worldcup.teams.json',
  groups: 'worldcup.groups.json',
  matches: 'worldcup.json',
  squads: 'worldcup.squads.json',
}

async function getJson(file, { signal } = {}) {
  const response = await fetch(`${BASE_URL}/${file}`, { signal })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file} (HTTP ${response.status})`)
  }
  return response.json()
}

export function fetchTeams(opts) {
  return getJson(SOURCE_FILES.teams, opts)
}

export function fetchGroups(opts) {
  return getJson(SOURCE_FILES.groups, opts)
}

export function fetchMatches(opts) {
  return getJson(SOURCE_FILES.matches, opts)
}

export function fetchSquads(opts) {
  return getJson(SOURCE_FILES.squads, opts)
}

export async function fetchAllRaw(opts) {
  const [teams, groups, matches, squads] = await Promise.all([
    fetchTeams(opts),
    fetchGroups(opts),
    fetchMatches(opts),
    fetchSquads(opts),
  ])
  return { teams, groups, matches, squads }
}
