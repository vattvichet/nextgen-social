export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  const ranges = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [unit, secondsInUnit] of ranges) {
    const value = Math.floor(seconds / secondsInUnit)
    if (value >= 1) {
      return `${value} ${unit}${value > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

export function formatRetryAfter(seconds) {
  if (seconds < 60) return 'less than a minute'
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.round(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'}`
}
