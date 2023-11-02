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

const getCronTimeMinus1Hour = (cronTime: string) => {
  const next = parser.parseExpression(cronTime, { tz: 'UTC' }).next()
  const minus1Hour = new Date(next.getTime() - 1 * 60 * 60 * 1000)
  const minus1HourCronTime = `${minus1Hour.getUTCMinutes()} ${minus1Hour.getUTCHours()} ${minus1Hour.getUTCDate()} ${
    minus1Hour.getUTCMonth() + 1
  } *`

  return minus1HourCronTime
}

export { getQuestionAndResultTime, getCronTimeMinus1Hour }
