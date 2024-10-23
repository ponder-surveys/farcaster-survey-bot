import { ReactionsType } from '@neynar/nodejs-sdk'
import {
  ReactionForCast,
  ReactionsCastResponse,
} from '@neynar/nodejs-sdk/build/neynar-api/v2'
import getErrorMessage from 'utils/getErrorMessage'
import logger from 'utils/logger'
import { neynarClient } from '../clients/neynar'
import { supabaseClient } from '../clients/supabase'
import { Poll } from '../types/polls'
import { getUserId } from './users'

const addReaction = async ({
  userId,
  questionId,
  responseId,
  type,
  createdAt,
}: {
  userId: number
  questionId: number
  responseId: number | null
  type: 'like' | 'recast'
  createdAt: string
}) => {
  const reactionsData: Reaction = {
    user_id: userId,
    question_id: questionId,
    response_id: responseId,
    type,
    created_at: createdAt,
  }

  if (process.env.NODE_ENV !== 'production') {
    logger.info(
      `Mock ${type} for user ${userId} on question ${questionId}${
        responseId ? `, response ${responseId}` : ''
      }.`
    )
    return null
  }

  try {
    await supabaseClient.from('reactions').insert(reactionsData)
  } catch (error) {
    const err = error as { code?: string }
    if (err.code === '23505') {
      logger.warn(
        `Duplicate reaction detected for user ${userId} on question ${questionId} with type ${type}. Skipping.`
      )
    } else {
      logger.error(`Error inserting reaction: ${getErrorMessage(error)}`)
    }
  }
}

const addReactionsByFids = async ({
  questionId,
  responseId = null,
  likes,
  recasts,
}: {
  questionId: number
  responseId?: number | null
  likes: ReactionForCast[]
  recasts: ReactionForCast[]
}) => {
  // Add likes
  for await (const like of likes) {
    const reactor = like.user
    const user = {
      fid: reactor.fid,
      username: reactor.username,
      displayName: reactor.display_name,
      pfp: { url: reactor.pfp_url },
      verifications: reactor.verifications,
      activeStatus: reactor.active_status,
    } as NeynarUser
    const reactorUserId = await getUserId(user)

    await addReaction({
      userId: reactorUserId,
      questionId: questionId,
      responseId: responseId,
      type: 'like',
      createdAt: like.reaction_timestamp,
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Add recasts
  for await (const recast of recasts) {
    const reactor = recast.user
    const user = {
      fid: reactor.fid,
      username: reactor.username,
      displayName: reactor.display_name,
      pfp: { url: reactor.pfp_url },
      verifications: reactor.verifications,
      activeStatus: reactor.active_status,
    } as NeynarUser
    const reactorUserId = await getUserId(user)

    await addReaction({
      userId: reactorUserId,
      questionId: questionId,
      responseId: responseId,
      type: 'recast',
      createdAt: recast.reaction_timestamp,
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

const fetchReactions = async (
  castHash: string,
  cursor?: string,
  reactions: ReactionForCast[] = []
): Promise<ReactionForCast[]> => {
  const neynarReactions: ReactionsCastResponse =
    await neynarClient.fetchReactionsForCast(castHash, ReactionsType.All, {
      limit: 100,
      cursor,
    })

  // NOTE: This is a temporary workaround to avoid rate limiting
  await new Promise((r) => setTimeout(r, 1000))

  // Accumulate the raw reactions
  reactions.push(...neynarReactions.reactions)

  if (neynarReactions.next?.cursor) {
    return fetchReactions(castHash, neynarReactions.next.cursor, reactions)
  } else {
    return reactions
  }
}

const addResultReactions = async (
  question: Question | Poll,
  responses: QuestionResponse[]
) => {
  try {
    // Add question reactions
    const reactionData: ReactionForCast[] = await fetchReactions(
      question.cast_hash as string
    )

    const likes = reactionData.filter(
      (reaction) => reaction.reaction_type === 'like'
    )
    const recasts = reactionData.filter(
      (reaction) => reaction.reaction_type === 'recast'
    )

    await addReactionsByFids({
      questionId: question.id,
      likes: likes,
      recasts: recasts,
    })

    // Add response reactions
    for (const response of responses) {
      if (response.cast_hash !== question.cast_hash && response.comment) {
        try {
          const reactionData: ReactionForCast[] = await fetchReactions(
            response.cast_hash as string
          )

          const likes = reactionData.filter(
            (reaction) => reaction.reaction_type === 'like'
          )
          const recasts = reactionData.filter(
            (reaction) => reaction.reaction_type === 'recast'
          )

          await addReactionsByFids({
            questionId: question.id,
            responseId: response.id,
            likes: likes,
            recasts: recasts,
          })
        } catch (error) {
          logger.error(
            `Error fetching reactions for response ${
              response.id
            }: ${getErrorMessage(error)}`
          )
          continue
        }
      }
    }
  } catch (error) {
    console.error(
      `Error fetching reactions for question ${question.id}: ${getErrorMessage(
        error
      )}`
    )
  }
}

export { addReaction, addReactionsByFids, addResultReactions }
