export function formatMessageTime(iso: string): string {
  const date = new Date(iso)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours < 12 ? '오전' : '오후'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  const paddedMinutes = String(minutes).padStart(2, '0')
  return `${period} ${hour12}:${paddedMinutes}`
}
