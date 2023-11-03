import { publishCast, publishReply } from '../api/casts'
import { getNextQuestion, updateNextQuestion } from '../api/questions'
import { getUsername } from '../api/users'
import { farcasterClient } from '../clients/farcaster'
import { formatQuestion, formatReply } from '../utils/formatQuestion'
import { calculateByteSize } from '../utils/byteSize'
import { MAX_BYTE_SIZE } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'
import { getChannelParentUrl } from '../utils/getChannelParentUrl'

const publishNextQuestion = async (type: 'general' | 'channel') => {
  const question = await getNextQuestion(type)

  if (!question) {
    console.log(`${getDateTag()} No questions to publish.`)
    return
  }

  const username = await getUsername(question.user_id)
  const formattedQuestion = formatQuestion(question, username)
  const formattedReply = formatReply()

  const questionByteSize = calculateByteSize(formattedQuestion)
  const replyByteSize = calculateByteSize(formattedReply)

  if (questionByteSize >= MAX_BYTE_SIZE || replyByteSize >= MAX_BYTE_SIZE) {
    console.error(
      `${getDateTag()} Error: Question or Reply is too large to publish.\nQuestion Size: ${questionByteSize} bytes. Reply Size: ${replyByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
    )
    return
  }

  if (process.env.NODE_ENV === 'production') {
    let hash = ''
    let createdAt = ''

    if (type === 'channel' && question.channel) {
      const parentUrl = await getChannelParentUrl(question.channel)
      const result = await publishReply(
        'question',
        parentUrl,
        formattedQuestion,
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
  } else {
    console.log(
      `${getDateTag()} Mock question${
        question.channel ? ` in ${question.channel} channel` : ''
      }:\n\n${formattedQuestion}`
    )
    console.log(`${getDateTag()} Mock reply:\n\n${formattedReply}`)
  }
}

export { publishNextQuestion }
