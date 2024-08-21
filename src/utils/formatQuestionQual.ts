import { APP_URL } from './constants'

const formatReplyToQuestionQual = (
  responseCount: number,
  numBounties: number,
  questionId: string
): string => {
  const updateInterval = Number(
    process.env.NEXT_QUESTION_QUAL_UPDATE_INTERVAL_HOURS || 24
  ) // Default to 24 hours if not set

  const msg = `💭 Your question got ${responseCount} responses and you still have ${numBounties} bounties to award after ${updateInterval} hours.

Reward responses directly in the frame. You can also read all of them here: ${APP_URL}/questions/${questionId}`

  return msg
}

export { formatReplyToQuestionQual }
