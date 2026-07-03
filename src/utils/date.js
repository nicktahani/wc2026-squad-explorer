import { DateTime } from 'luxon'

export function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatLocalMatchDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    return {
      date: formatDate(dateStr),
      time: timeStr || '',
    }
  }

  const date = DateTime
    .fromFormat(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm 'UTC'Z")
    .toLocal()

  if (!date.isValid) {
    return {
      date: formatDate(dateStr),
      time: timeStr,
    }
  }

  return {
    date: date.toFormat('MMM d'),
    time: date.toFormat('h:mma ZZZZ'),
  }
}
