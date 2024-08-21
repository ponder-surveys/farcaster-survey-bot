import {
  getNextQuestionsQual,
  getQuestionBountyAmount,
  updateNextQuestionQual,
} from '../api/questionsQual'
import { publishReply } from '../api/casts'
import { getDateTag } from '../utils/getDateTag'
import { getAnswersCount } from '../api/answersQual'
import { APP_URL } from '../utils/constants'
import { formatReplyToQuestionQual } from '../utils/formatQuestionQual'

const publishNextQuestionsQualUpdate = async () => {
  const questionsQual = await getNextQuestionsQual()

  for await (const questionQual of questionsQual) {
    const questionQualHash = questionQual.cast_hash as string
    const responseCount = await getAnswersCount(questionQual.id)

    const bountyAmount = await getQuestionBountyAmount(questionQual.id)

    const updateMessage = formatReplyToQuestionQual(
      responseCount,
      bountyAmount.amount[0] / 3,
      questionQual.id
    )

    if (process.env.NODE_ENV === 'production') {
      try {
        if (questionQualHash && responseCount > 0) {
          await publishReply(
            'question reply',
            questionQualHash,
            updateMessage,
            `${APP_URL}/questions/${questionQual.id}`
          )

          await updateNextQuestionQual(questionQual.id)
          console.log(
            `${getDateTag()} Update status updated for ${questionQual.id}.`
          )
        }
      } catch (error) {
        console.error(
          `${getDateTag()} Error publishing update for question ${
            questionQual.id
          }:`,
          error
        )
      }
    } else {
      if (questionQualHash && responseCount > 0) {
        console.log(
          `${getDateTag()} Mock question update:\n${updateMessage}\n${APP_URL}/questions/${
            questionQual.id
          }`
        )
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log(`${getDateTag()} Published Q&A updates.`)
}

export { publishNextQuestionsQualUpdate }
