import { publishCast, publishReply } from '../api/casts'
import { getNextQuestion, updateNextQuestion } from '../api/questions'
import { getUsername } from '../api/users'
import { neynarClient } from '../clients/neynar'
import { calculateByteSize } from '../utils/byteSize'
import { MAX_BYTE_SIZE, SURVEY_FRAME_URL } from '../utils/constants'
import { formatQuestion } from '../utils/formatQuestion'
import logger from '../utils/logger'

const publishNextQuestion = async (type: QuestionType) => {
  const question = await getNextQuestion(type)

  if (!question) {
    type !== 'expedited' && logger.info(`No ${type} questions to publish.`) // Expedited questions not logged due to high polling frequency
    return
  }

  const username = await getUsername(question.user_id)
  const formattedQuestion = formatQuestion(question, username)

  const questionByteSize = calculateByteSize(formattedQuestion)

  if (questionByteSize >= MAX_BYTE_SIZE) {
    logger.error(
      `Question is too large to publish.\nQuestion Size: ${questionByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
    )
    return
  }

  if (process.env.NODE_ENV === 'production') {
    let hash = ''
    let createdAt = ''

    if (question.channel) {
      const { channel } = await neynarClient.lookupChannel(question.channel)
      const result = await publishReply(
        'question',
        channel.url,
        formattedQuestion,
        `${SURVEY_FRAME_URL}/${question.id}`
      )

      hash = result.hash
      const { cast: resultCast } =
        await neynarClient.lookUpCastByHashOrWarpcastUrl(hash, 'hash')
      createdAt = resultCast?.timestamp as string
    } else {
      const result = await publishCast(
        'question',
        formattedQuestion,
        `${SURVEY_FRAME_URL}/${question.id}`
      )

      hash = result.hash
      const { cast: resultCast } =
        await neynarClient.lookUpCastByHashOrWarpcastUrl(hash, 'hash')
      createdAt = resultCast?.timestamp as string
    }

    await updateNextQuestion(hash, question.id, createdAt)
  } else {
    logger.info(
      `Mock question${
        question.channel ? ` in ${question.channel} channel` : ''
      }:\n\n${formattedQuestion}\n\n${SURVEY_FRAME_URL}/${question.id}`
    )
  }
}

export { publishNextQuestion }
