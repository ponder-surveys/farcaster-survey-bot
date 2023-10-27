import { publishCast, publishReply } from '../api/casts'
import { getNextQuestions, updateNextQuestion } from '../api/questions'
import { getUsername } from '../api/users'
import { farcasterClient } from '../clients/farcaster'
import { formatQuestion, formatReply } from '../utils/formatQuestion'
import { calculateByteSize } from '../utils/byteSize'
import { CONTENT_FID, MAX_BYTE_SIZE } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'
import { getChannelParentUrl } from '../utils/getChannelParentUrl'

const publishNextQuestions = async (type: 'general' | 'channel') => {
  const questions = await getNextQuestions(type)

  for (const question of questions) {
    const username = await getUsername(question.user_id)
    const formattedQuestion = formatQuestion(question, username)
    const formattedReply = formatReply()

    const questionByteSize = calculateByteSize(formattedQuestion)
    if (questionByteSize >= MAX_BYTE_SIZE) {
      console.error(
        `${getDateTag()} Error: Question is too large to publish.\nSize: ${questionByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
      )
      continue
    }

    const replyByteSize = calculateByteSize(formattedReply)
    if (replyByteSize >= MAX_BYTE_SIZE) {
      console.error(
        `${getDateTag()} Error: Reply is too large to publish.\nSize: ${replyByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
      )
      continue
    }

    if (process.env.NODE_ENV === 'production') {
      let hash = ''
      let createdAt = ''

      if (type === 'channel' && question.channel) {
        const parentUrl = await getChannelParentUrl(question.channel)
        const result = await publishReply(
          formattedQuestion,
          parentUrl,
          CONTENT_FID,
          formattedReply
        )
        hash = result.hash
        const resultCast = await farcasterClient.v2.fetchCast(hash)
        createdAt = resultCast?.timestamp as string
      } else {
        const result = await publishCast(
          'question',
          formattedQuestion,
          formattedReply
        )
        hash = result.hash
        const resultCast = await farcasterClient.v2.fetchCast(hash)
        createdAt = resultCast?.timestamp as string
      }

      await updateNextQuestion(hash, question.id, createdAt)
      await new Promise((resolve) => setTimeout(resolve, 250))
    } else {
      console.log(
        `${getDateTag()} Mock question cast${
          question.channel ? ` in ${question.channel} channel` : ''
        }:\n\n${formattedQuestion}`
      )
      console.log(`${getDateTag()} Mock reply:\n\n${formattedReply}`)
    }
  }
}

export { publishNextQuestions }
