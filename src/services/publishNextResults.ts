import {
  getNextResults,
  getExpiredPredictivePolls,
  updateNextResult,
  updatePredictivePollResult,
} from '../api/results'
import { getResponses, updateResponse } from '../api/responses'
import { addResultReactions } from '../api/reactions'
import { getUserId } from '../api/users'
import { getCastsInThread, publishReply } from '../api/casts'
import { formatReplyToSurvey } from '../utils/formatResult'
import { getDateTag } from '../utils/getDateTag'
import { SURVEY_FRAME_URL } from '../utils/constants'

export const publishNextResults = async () => {
  const results = await getNextResults()

  for await (const result of results) {
    let responses = await getResponses(result.id)
    const replyToSurvey = formatReplyToSurvey(responses.length)

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
          try {
            responses = await getResponses(result.id)
            await addResultReactions(result, responses)
          } catch (reactionError) {
            console.error(
              `${getDateTag()} Error adding reactions for result ${result.id}:`,
              reactionError
            )
          }

          await publishReply(
            'question reply',
            resultHash,
            replyToSurvey,
            `${SURVEY_FRAME_URL}/${result.id}/results`
          )
        }
      } catch (error) {
        console.error(
          `${getDateTag()} Error publishing result ${result.id}:`,
          error
        )
      }
      try {
        await updateNextResult(result.id)
        console.log(`${getDateTag()} Result status updated for ${result.id}.`)
      } catch (updateError) {
        console.error(
          `${getDateTag()} Error updating result status for ${result.id}:`,
          updateError
        )
      }
    } else {
      console.log(
        `${getDateTag()} Mock survey reply:\n${replyToSurvey}\n${SURVEY_FRAME_URL}/${
          result.id
        }`
      )
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log(`${getDateTag()} Published poll results.`)
}

export const publishPredictivePollResults = async () => {
  const predictivePolls = await getExpiredPredictivePolls()

  for await (const poll of predictivePolls) {
    let responses = await getResponses(poll.id)
    const replyToSurvey = 'Predictive poll finished!' // NOTE: Placeholder

    if (process.env.NODE_ENV === 'production') {
      const resultHash = poll.cast_hash as string

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
              await updateResponse(userId, poll.id, cast.text, cast.hash)
            }
            await new Promise((resolve) => setTimeout(resolve, 250))
          }

          // Get updated responses and add reactions
          try {
            responses = await getResponses(poll.id)
            await addResultReactions(poll, responses)
          } catch (reactionError) {
            console.error(
              `${getDateTag()} Error adding reactions for result ${poll.id}:`,
              reactionError
            )
          }

          // NOTE: Removed publishReply call as messaging is likely to be different
        }
      } catch (error) {
        console.error(
          `${getDateTag()} Error publishing result ${poll.id}:`,
          error
        )
      }
      try {
        await updatePredictivePollResult(poll.id)
        console.log(`${getDateTag()} Result status updated for ${poll.id}.`)
      } catch (error) {
        console.error(
          `${getDateTag()} Error updating result status for ${poll.id}:`,
          error
        )
      }
    } else {
      console.log(replyToSurvey) // NOTE: Placeholder
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log(`${getDateTag()} Published poll results.`)
}
