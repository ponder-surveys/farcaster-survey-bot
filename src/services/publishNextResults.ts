import { getCastsInThread, publishReply } from '../api/casts'
import { addResultReactions } from '../api/reactions'
import { getResponses, updateResponse } from '../api/responses'
import {
  getExpiredPredictivePolls,
  getNextResults,
  updateNextResult,
  updatePredictivePollResult,
} from '../api/results'
import { getUserId } from '../api/users'
import { SURVEY_FRAME_URL } from '../utils/constants'
import { formatReplyToSurvey } from '../utils/formatResult'
import getErrorMessage from '../utils/getErrorMessage'
import logger from '../utils/logger'

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
            logger.error(
              `Error adding reactions for result ${result.id}:`,
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
        logger.error(
          `Error publishing result ${result.id}:`,
          getErrorMessage(error)
        )
      }
      try {
        await updateNextResult(result.id)
        logger.info(`Result status updated for ${result.id}.`)
      } catch (updateError) {
        logger.error(
          `Error updating result status for ${result.id}:`,
          getErrorMessage(updateError)
        )
      }
    } else {
      logger.info(
        `Mock survey reply:\n${replyToSurvey}\n${SURVEY_FRAME_URL}/${result.id}`
      )
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  logger.info(`Published poll results.`)
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
            logger.error(
              `Error adding reactions for result ${poll.id}:`,
              getErrorMessage(reactionError)
            )
          }

          // NOTE: Removed publishReply call as messaging is likely to be different
        }
      } catch (error) {
        logger.error(
          `Error publishing result ${poll.id}:`,
          getErrorMessage(error)
        )
      }
      try {
        await updatePredictivePollResult(poll.id)
        logger.info(`Result status updated for ${poll.id}.`)
      } catch (error) {
        logger.error(
          `Error updating result status for ${poll.id}:`,
          getErrorMessage(error)
        )
      }
    } else {
      logger.info(replyToSurvey) // NOTE: Placeholder
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  logger.info(`Published poll results.`)
}
