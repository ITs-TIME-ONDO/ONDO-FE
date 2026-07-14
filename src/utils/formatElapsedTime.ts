export const formatElapsedTime = (timestamp?: string | null): string => {
  const time = timestamp ? new Date(timestamp).getTime() : NaN

  if (Number.isNaN(time)) {
    return '\uBC29\uAE08 \uC804'
  }

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - time) / 1000 / 60)
  )

  if (diffMinutes < 1) {
    return '\uBC29\uAE08 \uC804'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}\uBD84 \uC804`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}\uC2DC\uAC04 \uC804`
  }

  const diffDays = Math.floor(diffHours / 24)

  return `${diffDays}\uC77C \uC804`
}
