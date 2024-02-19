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
    const resultHash = result.cast_hash as string
    const castIterator = await getCastsInThread(resultHash)

    let responses = await getResponses(result.id)
    const replyToSurvey = formatReplyToSurvey(responses.length)

    console.log(`${getDateTag()} Publishing result ${result.id}...`)

    if (process.env.NODE_ENV === 'production') {
      // Populate missing comments
      for await (const cast of castIterator) {
        const castAuthor = cast.author as unknown as NeynarUser // Temporary fix for farcaster-js-neynar CastAuthorOneOf only having fid
        const userId = await getUserId(castAuthor)

        const foundResponse = responses.find(
          (response) => response.user_id === userId
        )

        if (foundResponse && !foundResponse.comment) {
          await updateResponse(userId, result.id, cast.text, cast.hash)
        }
      }

      // Get updated responses
      responses = await getResponses(result.id)

      await addResultReactions(result, responses)
      await updateNextResult(result.id)
      await publishReply(
        'question reply',
        result.cast_hash as string,
        replyToSurvey
      )

      await new Promise((resolve) => setTimeout(resolve, 250))
    } else {
      console.log(`${getDateTag()} Mock survey reply:\n\n${replyToSurvey}`)
    }
  }
}

export { publishNextResults }
