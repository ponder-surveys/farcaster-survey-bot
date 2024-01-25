import { publishCast, publishReply } from '../api/casts'
import { getNextQuestion, updateNextQuestion } from '../api/questions'
import { getUsername } from '../api/users'
import { neynarClient } from '../clients/neynar'
import { formatQuestion, formatReply } from '../utils/formatQuestion'
import { calculateByteSize } from '../utils/byteSize'
import { MAX_BYTE_SIZE } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'

const publishNextQuestion = async (type: QuestionType) => {
  const question = await getNextQuestion(type)

  if (!question) {
    type !== 'expedited' &&
      console.log(`${getDateTag()} No ${type} questions to publish.`) // Expedited questions not logged due to high polling frequency
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

    if (question.channel) {
      const { channel } = await neynarClient.lookupChannel(question.channel)
      const result = await publishReply(
        'question',
        channel.url,
        formattedQuestion,
        question.image_url,
        formattedReply
      )
      hash = result.hash
      const { cast: resultCast } =
        await neynarClient.lookUpCastByHashOrWarpcastUrl(hash, 'hash')
      createdAt = resultCast?.timestamp as string
    } else {
      const result = await publishCast(
        'question',
        formattedQuestion,
        question.image_url,
        formattedReply
      )
      hash = result.hash
      const { cast: resultCast } =
        await neynarClient.lookUpCastByHashOrWarpcastUrl(hash, 'hash')
      createdAt = resultCast?.timestamp as string
    }

    await updateNextQuestion(hash, question.id, createdAt)
  } else {
    console.log(
      `${getDateTag()} Mock question${
        question.channel ? ` in ${question.channel} channel` : ''
      }:\n\n${formattedQuestion}\n\n${question.image_url}`
    )
    console.log(`${getDateTag()} Mock reply:\n\n${formattedReply}`)
  }
}

export { publishNextQuestion }
