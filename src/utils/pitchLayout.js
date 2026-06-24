// Y% per anchor point (0 = own goal line, 100 = opponent goal line).
// GK sits near own goal; DEF and ATT bound the outfield interpolation range.
const GK_Y_PCT = 5
const DEF_Y_PCT = 18
const ATT_Y_PCT = 44

// Classify a position abbreviation into a depth bucket.
// Order (defensive -> attacking): GK < DEF < MID < AMF < FWD
function getDepth(abbr) {
  const a = (abbr ?? '').toUpperCase()
  if (a === 'G' || a === 'GK') return 'GK'
  if (a.startsWith('CD') || ['CB', 'LB', 'RB', 'LWB', 'RWB', 'SW'].includes(a)) return 'DEF'
  if (a.startsWith('AM')) return 'AMF'
  if (a.startsWith('CF') || ['F', 'ST', 'SS', 'LW', 'RW', 'FW', 'LF', 'RF'].includes(a)) return 'FWD'
  return 'MID' // DM, CM, LM, RM, M, etc.
}

// Returns a 0–1 left-to-right sort key from a position abbreviation.
function getLateral(abbr) {
  const a = (abbr ?? '').toUpperCase()
  if (a.endsWith('-L') || ['LB', 'LWB', 'LM', 'LW', 'LF'].includes(a)) return 0 // wide left
  if (a.endsWith('-R') || ['RB', 'RWB', 'RM', 'RW', 'RF'].includes(a)) return 1 // wide right
  return 0.5                                                                    // center
}

const DEPTH_ORDER = ['DEF', 'MID', 'AMF', 'FWD']

/**
 * Returns a map of formationPlace -> { cx, cy } in SVG coordinates.
 *
 * @param {'home'|'away'} side - home defends at bottom (high SVG y)
 * @param {Array} starters - normalized player objects from espnClient
 * @param {{ L, R, T, B }} bounds - SVG pitch boundary coordinates
 */
export function getPlayerPositions(side, starters, { L, R, T, B }) {
  const isHome = side === 'home'

  function yPctToCy(pct) {
    return isHome
      ? Math.round(B - (pct / 100) * (B - T))
      : Math.round(T + (pct / 100) * (B - T))
  }

  // Group players by depth bucket
  const groups = {}
  for (const p of starters) {
    const depth = getDepth(p.positionAbbr)
    ;(groups[depth] ??= []).push(p)
  }

  const positions = {}

  // GK — centered near own goal
  for (const p of groups.GK ?? []) {
    positions[p.formationPlace] = { cx: Math.round((L + R) / 2), cy: yPctToCy(GK_Y_PCT) }
  }

  // Outfield rows — interpolate y between DEF_Y and ATT_Y based on depth order
  const activeDepths = DEPTH_ORDER.filter(d => groups[d]?.length > 0)
  activeDepths.forEach((depth, idx) => {
    const t = activeDepths.length === 1 ? 0.5 : idx / (activeDepths.length - 1)
    const yPct = DEF_Y_PCT + t * (ATT_Y_PCT - DEF_Y_PCT)
    const cy = yPctToCy(yPct)

    // Sort left-to-right by lateral score, then spread evenly across width
    const row = [...groups[depth]].sort((a, b) => getLateral(a.positionAbbr) - getLateral(b.positionAbbr))
    row.forEach((p, i) => {
      const cx = Math.round(L + ((i + 1) / (row.length + 1)) * (R - L))
      positions[p.formationPlace] = { cx, cy }
    })
  })

  return positions
}

