import '../styles/KnockoutStage.css'
import { getRoundAnchorId } from '../data/currentRound'
import MatchCard from './MatchCard'

const ROUND_ORDER = [
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Semi-final',
  'Match for third place',
  'Final',
]

export default function KnockoutStage({ matches }) {
  const knockoutMatches = matches.filter(match => match.stage === 'knockout')
  if (knockoutMatches.length === 0) return null

  const matchesByRound = new Map()
  const unknownRounds = []

  for (const match of knockoutMatches) {
    const key = match.round ?? 'Other Knockout Matches'
    if (!matchesByRound.has(key)) {
      matchesByRound.set(key, {
        title: key,
        matches: [],
      })
      if (!ROUND_ORDER.includes(key)) unknownRounds.push(key)
    }
    matchesByRound.get(key).matches.push(match)
  }

  const orderedRoundKeys = [
    ...ROUND_ORDER,
    ...unknownRounds,
  ]

  return (
    <section className="knockout-stage" aria-labelledby="knockout-stage-title">
      <header className="knockout-stage__header">
        <h2 id="knockout-stage-title" className="knockout-stage__title">Knockout Stage</h2>
      </header>

      <div className="knockout-stage__rounds">
        {orderedRoundKeys.map(key => {
          const round = matchesByRound.get(key)
          if (!round) return null

          return (
            <section key={key} id={getRoundAnchorId(key)} className="knockout-round">
              <header className="knockout-round__header">
                <h3 className="knockout-round__title">{round.title}</h3>
              </header>
              <div className="knockout-round__matches">
                {round.matches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
