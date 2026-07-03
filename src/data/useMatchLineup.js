import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchEspnEvents, fetchEspnLineup } from './espnClient'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const LINEUP_RECHECK_MS = 20 * 60 * 1000

function useEspnEvents() {
  return useQuery({
    queryKey: ['espn', 'events'],
    queryFn: ({ signal }) => fetchEspnEvents({ signal }),
    staleTime: DAY_MS,
  })
}

// finds the ESPN event ID for an openfootball match by matching on date and team abbrs
function findEspnEvent(espnEvents, match) {
  if (!espnEvents || !match) return null
  const matchDate = new Date(match.date)
  return espnEvents.find(e => {
    if (!e.date) return false
    const diff = Math.abs(new Date(e.date) - matchDate)
    // allow for ~1 day tolerance since ESPN is UTC timestamp and openfootball is local date
    if (diff > 36 * 60 * 60 * 1000) return false  // skip if > 36 hrs 
    const codes = new Set([match.team1Code, match.team2Code])
    return codes.has(e.team1Abbr) && codes.has(e.team2Abbr)
  }) ?? null
}

function getLineupFetchAt(espnEvent) {
  if (!espnEvent?.kickoff) return null
  const kickoff = new Date(espnEvent.kickoff).getTime()
  return Number.isNaN(kickoff) ? null : kickoff - HOUR_MS
}

function getKickoffAt(espnEvent) {
  if (!espnEvent?.kickoff) return null
  const kickoff = new Date(espnEvent.kickoff).getTime()
  return Number.isNaN(kickoff) ? null : kickoff
}

function hasPlayers(team) {
  return (team?.starters?.length ?? 0) > 0 || (team?.subs?.length ?? 0) > 0
}

function hasAnnouncedLineup(lineup) {
  return hasPlayers(lineup?.home) && hasPlayers(lineup?.away)
}

function hasLineupShell(lineup) {
  return !!lineup?.home && !!lineup?.away
}

function useLineupClock(lineupFetchAt, kickoffAt) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const nextUpdateAt = now < lineupFetchAt ? lineupFetchAt : kickoffAt
    if (!nextUpdateAt || now >= nextUpdateAt) return undefined

    const timeout = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(nextUpdateAt - now, 60 * 1000)
    )

    return () => window.clearTimeout(timeout)
  }, [kickoffAt, lineupFetchAt, now])

  return now
}

// returns lineup data for a given openfootball match object
export function useMatchLineup(match) {
  const eventsQuery = useEspnEvents()
  const espnEvent = findEspnEvent(eventsQuery.data, match)
  const espnEventId = espnEvent?.id ?? null
  const lineupFetchAt = getLineupFetchAt(espnEvent)
  const kickoffAt = getKickoffAt(espnEvent)
  const now = useLineupClock(lineupFetchAt, kickoffAt)
  const shouldFetchLineup =
    !!espnEventId &&
    (!lineupFetchAt || now >= lineupFetchAt || match?.status === 'finished')
  const shouldPollLineup =
    !!lineupFetchAt && !!kickoffAt && now >= lineupFetchAt && now < kickoffAt

  const lineupQuery = useQuery({
    queryKey: ['espn', 'lineup', espnEventId],
    queryFn: ({ signal }) => fetchEspnLineup(espnEventId, { signal }),
    enabled: shouldFetchLineup,
    staleTime: query =>
      hasAnnouncedLineup(query.state.data) ? Infinity : LINEUP_RECHECK_MS,
    refetchInterval: query =>
      shouldPollLineup && !hasAnnouncedLineup(query.state.data)
        ? LINEUP_RECHECK_MS
        : false,
  })

  const error = eventsQuery.error ?? lineupQuery.error ?? null
  const lineup = lineupQuery.data ?? null

  let status = 'unavailable'
  if (eventsQuery.isPending || (shouldFetchLineup && lineupQuery.isPending)) {
    status = 'loading'
  } else if (error) {
    status = 'error'
  } else if (hasLineupShell(lineup)) {
    status = 'ready'
  }

  return {
    lineup,
    status,
    error,
  }
}
