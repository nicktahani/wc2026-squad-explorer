import { useQuery } from '@tanstack/react-query'
import { fetchEspnEvents, fetchEspnLineup } from './espnClient'

function useEspnEvents() {
  return useQuery({
    queryKey: ['espn', 'events'],
    queryFn: ({ signal }) => fetchEspnEvents({ signal }),
    staleTime: 24 * 60 * 60 * 1000,
  })
}

// finds the ESPN event ID for an openfootball match by matching on date and team abbrs
function findEspnEventId(espnEvents, match) {
  if (!espnEvents || !match) return null
  const matchDate = new Date(match.date)
  const event = espnEvents.find(e => {
    if (!e.date) return false
    const diff = Math.abs(new Date(e.date) - matchDate)
    // allow for ~1 day tolerance since ESPN is UTC timestamp and openfootball is local date
    if (diff > 36 * 60 * 60 * 1000) return false  // skip if > 36 hrs 
    const codes = new Set([match.team1Code, match.team2Code])
    return codes.has(e.team1Abbr) && codes.has(e.team2Abbr)
  })
  return event?.id ?? null
}


// returns lineup data for a given openfootball match object
export function useMatchLineup(match) {
  const eventsQuery = useEspnEvents()
  const espnEventId = findEspnEventId(eventsQuery.data, match)

  const lineupQuery = useQuery({
    queryKey: ['espn', 'lineup', espnEventId],
    queryFn: ({ signal }) => fetchEspnLineup(espnEventId, { signal }),
    enabled: !!espnEventId,
    // lineups don't change after a match ends
    staleTime: 60 * 60 * 1000,
  })

  const error = eventsQuery.error ?? lineupQuery.error ?? null
  const lineup = lineupQuery.data ?? null

  let status = 'unavailable'
  if (eventsQuery.isPending || (!!espnEventId && lineupQuery.isPending)) {
    status = 'loading'
  } else if (error) {
    status = 'error'
  } else if (lineup?.home && lineup?.away) {
    status = 'ready'
  }

  return {
    lineup,
    status,
    error,
  }
}
