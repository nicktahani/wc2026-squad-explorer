export function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
