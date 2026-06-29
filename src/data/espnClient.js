const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world'

const SCOREBOARD_DATES = '20260611-20260719'

// returns all events (matches) for the tournament as a flat array
// used for ID lookup when matching openfootball matches to ESPN events
export async function fetchEspnEvents({ signal } = {}) {
  const url = `${BASE_URL}/scoreboard?dates=${SCOREBOARD_DATES}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Scoreboard fetch failed (HTTP ${res.status})`)
  const data = await res.json()

  return (data.events ?? []).map(event => {
    const competitors = event.competitions?.[0]?.competitors ?? []
    const home = competitors.find(c => c.homeAway === 'home')
    const away = competitors.find(c => c.homeAway === 'away')
    return {
      id: event.id,
      // ISO date string, slice to YYYY-MM-DD for matching
      date: event.date?.split("T")?.[0] ?? null,
      team1Abbr: home?.team?.abbreviation ?? null,
      team2Abbr: away?.team?.abbreviation ?? null,
    }
  })
}

/*
   returns normalized lineup data for a single ESPN event
   shape:
   {
     home: { abbreviation, displayName, formation, starters, subs },
     away: { ... }
   }
   where each player is: { name, jersey, positionAbbr, positionName, starter, formationPlace, subbedIn, subbedOut }
*/
export async function fetchEspnLineup(espnEventId, { signal } = {}) {
  const url = `${BASE_URL}/summary?event=${espnEventId}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Summary fetch failed (HTTP ${res.status})`)
  const data = await res.json()

  const rosters = data.rosters ?? []

  function isStarter(value) {
    return value === true || value === 1 || value === 'true' || value === '1'
  }

  function normalizeRoster(rosterEntry) {
    const players = (rosterEntry.roster ?? []).map(p => ({
      name: p.athlete?.displayName ?? '',
      jersey: p.jersey ?? '',
      positionAbbr: p.position?.abbreviation ?? '',
      positionName: p.position?.displayName ?? p.position?.name ?? '',
      starter: isStarter(p.starter),
      formationPlace: p.formationPlace ? Number(p.formationPlace) : 0,
      subbedIn: p.subbedIn ?? false,
      subbedOut: p.subbedOut ?? false,
    }))
    return {
      abbreviation: rosterEntry.team?.abbreviation ?? '',
      displayName: rosterEntry.team?.displayName ?? '',
      formation: rosterEntry.formation ?? null,
      starters: players
        .filter(p => p.starter)
        .sort((a, b) => a.formationPlace - b.formationPlace),
      subs: players.filter(p => !p.starter),
    }
  }

  const homeEntry = rosters.find(r => r.homeAway === 'home')
  const awayEntry = rosters.find(r => r.homeAway === 'away')

  return {
    home: homeEntry ? normalizeRoster(homeEntry) : null,
    away: awayEntry ? normalizeRoster(awayEntry) : null,
  }
}
