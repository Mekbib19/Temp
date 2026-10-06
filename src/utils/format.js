export const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(value)

/**
 * Converts a timestamp/date to a clean human-friendly relative time:
 * e.g. "just now", "12 minutes ago", "3 hours ago", "2 days ago", "1 month ago", "2 years ago"
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput

  if (isNaN(date.getTime())) return ''

  const now = Date.now()
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000)

  // Future or barely elapsed
  if (diffInSeconds < 45) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return diffInYears <= 1 ? '1 year ago' : `${diffInYears} years ago`
}

/**
 * Returns latest update metadata for an item.
 * Rule: If updated_at is available, remove created_at and only keep latest update.
 * If only created_at is available, show when it was created.
 */
export const formatLatestUpdate = (record) => {
  if (!record) return { type: 'none', label: '', relativeText: '—', fullDate: '' }

  const hasUpdated = Boolean(record.updated_at)
  const hasCreated = Boolean(record.created_at)

  if (hasUpdated) {
    const relative = formatRelativeTime(record.updated_at)
    return {
      type: 'updated',
      label: 'Updated',
      relativeText: `Updated ${relative}`,
      relativeOnly: relative,
      fullDate: new Date(record.updated_at).toLocaleString(),
    }
  }

  if (hasCreated) {
    const relative = formatRelativeTime(record.created_at)
    return {
      type: 'created',
      label: 'Created',
      relativeText: `Created ${relative}`,
      relativeOnly: relative,
      fullDate: new Date(record.created_at).toLocaleString(),
    }
  }

  return {
    type: 'none',
    label: '',
    relativeText: '—',
    relativeOnly: '—',
    fullDate: '',
  }
}

