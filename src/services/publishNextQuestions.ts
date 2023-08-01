import { publishCast, publishReply } from '../api/casts'
import { getNextQuestions, updateNextQuestion } from '../api/questions'
import { formatQuestion, formatReply } from '../utils/formatQuestion'
import { calculateByteSize } from '../utils/byteSize'
import { CONTENT_FID, MAX_BYTE_SIZE } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'
import { getChannelHash } from '../utils/getChannelHash'

const publishNextQuestions = async () => {
  const questions = await getNextQuestions()

  for (const question of questions) {
    const formattedQuestion = formatQuestion(question)
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

      if (question.channel) {
        const channelHash = getChannelHash(question.channel.toLowerCase())
        const result = await publishReply(
          formattedQuestion,
          channelHash,
          CONTENT_FID,
          formattedReply
        )
        hash = result.hash
      } else {
        const result = await publishCast(
          'question',
          formattedQuestion,
          formattedReply
        )
        hash = result.hash
      }

      await updateNextQuestion(hash, question.id)
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
