import { publishCast, publishReply } from '../api/casts'
import {
  getNextDirectQuestion,
  updateNextDirectQuestion,
} from '../api/direct-questions'
import { getUsername } from '../api/users'
import { neynarClient } from '../clients/neynar'
import { calculateByteSize } from '../utils/byteSize'
import { MAX_BYTE_SIZE } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'
import {
  formatDirectQuestion,
  formatDirectReply,
} from '../utils/formatDirectQuestion'

const publishNextDirectQuestion = async () => {
  const directQuestion = await getNextDirectQuestion()

  if (!directQuestion) {
    return
  }

  const recipientUsername = await getUsername(directQuestion.recipient_id)
  const authorUsername = directQuestion.anonymous
    ? null
    : await getUsername(directQuestion.author_id)
  const formattedQuestion = formatDirectQuestion(
    directQuestion,
    recipientUsername,
    authorUsername
  )
  const formattedReply = formatDirectReply()

  const questionByteSize = calculateByteSize(formattedQuestion)
  const replyByteSize = calculateByteSize(formattedReply)

  if (questionByteSize >= MAX_BYTE_SIZE || replyByteSize >= MAX_BYTE_SIZE) {
    console.error(
      `${getDateTag()} Error: Direct Question or Reply is too large to publish.\nQuestion Size: ${questionByteSize} bytes. Reply Size: ${replyByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
    )
    return
  }

  if (process.env.NODE_ENV === 'production') {
    let hash = ''
    let updatedAt = ''

    if (directQuestion.channel) {
      const { channel } = await neynarClient.lookupChannel(
        directQuestion.channel
      )
      const result = await publishReply(
        'direct question',
        channel.url,
        formattedQuestion,
        directQuestion.image_url,
        formattedReply
      )
      hash = result.hash
      const { cast: resultCast } =
        await neynarClient.lookUpCastByHashOrWarpcastUrl(hash, 'hash')
      updatedAt = resultCast?.timestamp as string
    } else {
      const result = await publishCast(
        'direct question',
        formattedQuestion,
        directQuestion.image_url,
        formattedReply
      )
      hash = result.hash
      const { cast: resultCast } =
        await neynarClient.lookUpCastByHashOrWarpcastUrl(hash, 'hash')
      updatedAt = resultCast?.timestamp as string
    }

    await updateNextDirectQuestion(hash, directQuestion.id, updatedAt)
  } else {
    console.log(
      `${getDateTag()} Mock direct question${
        directQuestion.channel ? ` in ${directQuestion.channel} channel` : ''
      }:\n\n${formattedQuestion}${
        directQuestion.image_url ? `\n\n${directQuestion.image_url}` : ''
      }`
    )
    console.log(`${getDateTag()} Mock reply:\n\n${formattedReply}`)
  }
}

export { publishNextDirectQuestion }
