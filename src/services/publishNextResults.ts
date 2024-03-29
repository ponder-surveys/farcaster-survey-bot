import { getNextResults, updateNextResult } from '../api/results'
import { getResponses, updateResponse } from '../api/responses'
import { addResultReactions } from '../api/reactions'
import { getUserId } from '../api/users'
import { getCastsInThread, publishReply } from '../api/casts'
import { formatReplyToSurvey } from '../utils/formatResult'
import { getDateTag } from '../utils/getDateTag'

const publishNextResults = async () => {
  const results = await getNextResults()

  for await (const result of results) {
    let responses = await getResponses(result.id)
    const replyToSurvey = formatReplyToSurvey(responses.length)

    console.log(`${getDateTag()} Publishing result ${result.id}...`)

    if (process.env.NODE_ENV === 'production') {
      const resultHash = result.cast_hash as string

      try {
        if (resultHash) {
          // Populate missing comments
          const castIterator = await getCastsInThread(resultHash)
          for await (const cast of castIterator) {
            const castAuthor = cast.author as unknown as NeynarUser // Temporary fix for farcaster-js-neynar CastAuthorOneOf only having fid
            const userId = await getUserId(castAuthor)

            const foundResponse = responses.find(
              (response) => response.user_id === userId
            )

            if (foundResponse && !foundResponse.comment) {
              await updateResponse(userId, result.id, cast.text, cast.hash)
            }
            await new Promise((resolve) => setTimeout(resolve, 250))
          }

          // Get updated responses and add reactions
          responses = await getResponses(result.id)
          await addResultReactions(result, responses)

          await publishReply('question reply', resultHash, replyToSurvey)
        }
        await updateNextResult(result.id)
      } catch (error) {
        console.error(
          `${getDateTag()} Error publishing result ${result.id}:`,
          error
        )
      }
    } else {
      console.log(`${getDateTag()} Mock survey reply:\n${replyToSurvey}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

export { publishNextResults }
