import { formatRetryAfter } from './format'

export function extractErrorMessage(err, fallback) {
  const data = err.response?.data

  if (err.response?.status === 429) {
    const retryAfter = Number(err.response.headers?.['retry-after'])
    const base = data?.message || 'Too many requests.'
    return retryAfter ? `${base} Try again in ${formatRetryAfter(retryAfter)}.` : base
  }

  if (data?.errors) {
    const firstError = Object.values(data.errors)[0]?.[0]
    if (firstError) return firstError
  }

  return data?.message || fallback
}
