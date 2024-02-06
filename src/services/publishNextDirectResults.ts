import {
  getNextDirectResults,
  updateNextDirectResult,
} from '../api/direct-results'
import { addDirectResponse } from '../api/direct-responses'
import { addDirectResultReactions } from '../api/direct-reactions'
import { getUserId, getUsername } from '../api/users'
import { getCastsInThread, publishReply } from '../api/casts'
import { getDateTag } from '../utils/getDateTag'
import { formatDirectResult } from '../utils/formatDirectResult'

const publishNextDirectResults = async () => {
  const directResults = await getNextDirectResults()

  for await (const directResult of directResults) {
    const {
      id: directResultId,
      question: directResultQuestion,
      cast_hash: directResultHash,
      author_id: directResultAuthorId,
      recipient_id: directResultRecipientId,
      anonymous,
    } = directResult
    const castIterator = await getCastsInThread(directResultHash as string)

    for await (const cast of castIterator) {
      const castAuthor = cast.author as unknown as NeynarUser // Temporary fix for farcaster-js-neynar CastAuthorOneOf only having fid
      const userId = await getUserId(castAuthor)

      if (directResultRecipientId === userId) {
        if (process.env.NODE_ENV === 'production') {
          const authorUsername = anonymous
            ? null
            : await getUsername(directResultAuthorId)
          const formattedDirectResult = formatDirectResult(authorUsername)
          await publishReply(
            'direct question success reply',
            cast.hash,
            formattedDirectResult
          )
          await updateNextDirectResult(directResultId, 'ANSWERED')
          const directResponse = await addDirectResponse({
            direct_question_id: directResultId,
            recipient_id: userId,
            answer: cast.text,
            cast_hash: cast.hash,
          })
          await addDirectResultReactions(directResult, directResponse)
        } else {
          console.log(
            `${getDateTag()} Recipient ${directResultRecipientId} has answered the Direct Question:\n\n${directResultQuestion}\n\nAnswer:\n\n${
              cast.text
            }`
          )
        }
      }
    }
  }
}

export { publishNextDirectResults }
