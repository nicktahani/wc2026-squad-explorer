function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getRoundAnchorId(round) {
  return slugify(round) || 'final'
}

// find the first match that is not finished
// use this to determine the current round for the button jump
export function getCurrentRoundTarget(matches) {
  const match = matches?.find(match => !match.score?.ft)
  if (!match) return null

  return {
    round: match.round,
    anchorId: getRoundAnchorId(match.round),
  }
}
