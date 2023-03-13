import * as parser from 'cron-parser'

const formatCronTime = (cronTime: string, type: string) => {
  const next = parser.parseExpression(cronTime).next()

  const diffMs = next.getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const diffMinutes = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const remainingHours = diffHours % 24
  const remainingMinutes = diffMinutes % 60
  const remainingSeconds = diffSec % 60

  return `\nNext ${type} in ${diffDays} days, ${remainingHours} hours, ${remainingMinutes} minutes, and ${remainingSeconds} seconds`
}

export { formatCronTime }
