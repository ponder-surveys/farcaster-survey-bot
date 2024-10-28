import getErrorMessage from 'utils/getErrorMessage'
import logger from 'utils/logger'
import { getAnswersCount } from '../api/answersQual'
import { publishReply } from '../api/casts'
import {
  getNextQuestionsQual,
  getQuestionBountyAmount,
  updateNextQuestionQual,
} from '../api/questionsQual'
import { APP_URL } from '../utils/constants'
import { formatReplyToQuestionQual } from '../utils/formatQuestionQual'

const publishNextQuestionsQualUpdate = async () => {
  const questionsQual = await getNextQuestionsQual()

  for await (const questionQual of questionsQual) {
    const questionQualHash = questionQual.cast_hash as string
    const responseCount = await getAnswersCount(questionQual.id)

    const { amount, tokenName } = await getQuestionBountyAmount(questionQual.id)

    const updateMessage = formatReplyToQuestionQual(
      responseCount,
      amount,
      tokenName
    )

    if (process.env.NODE_ENV === 'production') {
      try {
        if (questionQualHash && responseCount > 0) {
          // NOTE: This is trace for now because an error is expected every time so this isn't
          // useful.
          logger.trace(`Publishing update for question ${questionQual.id}.`)
          logger.trace(`questionQualHash: ${questionQualHash}`)
          const _publishReplyResponse = await publishReply(
            'question reply',
            questionQualHash,
            updateMessage,
            `${APP_URL}/questions/${questionQual.id}`
          )
          const _updateNextQuestionQualResponse = await updateNextQuestionQual(
            questionQual.id
          )
          logger.info(`Update status updated for ${questionQual.id}.`)
        }
      } catch (error) {
        // NOTE: This is trace for now because we're currently expecting this error and don't
        // want to pollute the log stream.
        logger.trace(
          `Error publishing update for question ${questionQual.id}:`,
          getErrorMessage(error)
        )
      }
    } else {
      if (questionQualHash && responseCount > 0) {
        logger.info(
          `Mock question update:\n${updateMessage}\n${APP_URL}/questions/${questionQual.id}`
        )
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  logger.info('Published Q&A updates.')
}

export { publishNextQuestionsQualUpdate }
