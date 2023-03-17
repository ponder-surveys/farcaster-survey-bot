import * as parser from 'cron-parser'

const formatCronTime = (type: string, cronTime: string) => {
  const next = parser.parseExpression(cronTime, { tz: 'UTC' }).next()
  const currentTime = new Date()
  const utcTime = Date.UTC(
    currentTime.getUTCFullYear(),
    currentTime.getUTCMonth(),
    currentTime.getUTCDate(),
    currentTime.getUTCHours(),
    currentTime.getUTCMinutes(),
    currentTime.getUTCSeconds()
  )

  const diffMs = next.getTime() - utcTime
  const diffSec = Math.round(diffMs / 1000)
  const diffMinutes = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const remainingHours = diffHours % 24
  const remainingMinutes = diffMinutes % 60
  const remainingSeconds = diffSec % 60

  return `\nNext ${type} in ${diffDays} days, ${remainingHours} hours, ${remainingMinutes} minutes, and ${remainingSeconds} seconds`
}

const getQuestionAndResultTime = (
  nextQuestionTime: string,
  nextResultTime: string
) => {
  const questionTime = formatCronTime('question', nextQuestionTime)
  const resultTime = formatCronTime('result', nextResultTime)

  console.log(questionTime, resultTime)
}

const getCronTimeMinus24Hours = (cronTime: string) => {
  const next = parser.parseExpression(cronTime, { tz: 'UTC' }).next()
  const minus24Hours = new Date(next.getTime() - 24 * 60 * 60 * 1000)
  const minus24HoursCronTime = `${minus24Hours.getUTCMinutes()} ${minus24Hours.getUTCHours()} ${minus24Hours.getUTCDate()} ${
    minus24Hours.getUTCMonth() + 1
  } *`

  return minus24HoursCronTime
}

export { getQuestionAndResultTime, getCronTimeMinus24Hours }
