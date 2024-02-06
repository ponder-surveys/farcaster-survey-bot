import { supabaseClient } from '../clients/supabase'
import { neynarClient } from '../clients/neynar'
import { getUserId } from './users'
import { getDateTag } from '../utils/getDateTag'

const addDirectReaction = async ({
  reactorId,
  questionId,
  responseId,
  type,
  createdAt,
}: {
  reactorId: number
  questionId: string
  responseId: string | null
  type: 'LIKE' | 'RECAST'
  createdAt: string
}) => {
  const reactionsData: DirectQuestionReaction = {
    reactor_id: reactorId,
    direct_question_id: questionId,
    direct_question_response_id: responseId,
    type,
    created_at: createdAt,
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `${getDateTag()} Mock ${type} for user ${reactorId} on question ${questionId}${
        responseId ? `, response ${responseId}` : ''
      }.`
    )
    return null
  }

  try {
    await supabaseClient
      .from('direct_questions_reactions')
      .insert(reactionsData)
  } catch (error) {
    const err = error as { code?: string }
    if (err.code === '23505') {
      console.warn(
        `${getDateTag()} Duplicate reaction detected for user ${reactorId} on direct question ${questionId} with type ${type}. Skipping.`
      )
    } else {
      console.error(`${getDateTag()} Error inserting reaction: `, error)
    }
  }
}

const addDirectReactionsByFids = async ({
  questionId,
  responseId = null,
  likes,
  recasts,
  timestamp,
}: {
  questionId: string
  responseId?: string | null
  likes: NeynarReaction[]
  recasts: NeynarReaction[]
  timestamp: string
}) => {
  // Add likes
  likes.forEach(async (like) => {
    const data = await neynarClient.lookupUserByFid(Number(like.fid))
    const reactor = data.result.user
    const reactorUserId = await getUserId(reactor)
    await addDirectReaction({
      reactorId: reactorUserId,
      questionId: questionId,
      responseId: responseId,
      type: 'LIKE',
      createdAt: timestamp,
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
  })

  // Add recasts
  recasts.forEach(async (recast) => {
    const data = await neynarClient.lookupUserByFid(Number(recast.fid))
    const reactor = data.result.user
    const reactorUserId = await getUserId(reactor)
    await addDirectReaction({
      reactorId: reactorUserId,
      questionId: questionId,
      responseId: responseId,
      type: 'RECAST',
      createdAt: timestamp,
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
  })
}

const addDirectResultReactions = async (
  directQuestion: DirectQuestion,
  directResponse: DirectQuestionResponse
) => {
  // Add direct question reactions
  const { cast: directQuestionCast } =
    await neynarClient.lookUpCastByHashOrWarpcastUrl(
      directQuestion.cast_hash as string,
      'hash'
    )
  const questionLikes = directQuestionCast.reactions.likes
  const questionRecasts = directQuestionCast.reactions.recasts

  await addDirectReactionsByFids({
    questionId: directQuestion.id,
    likes: questionLikes,
    recasts: questionRecasts,
    timestamp: directQuestionCast.timestamp,
  })

  // Add response reactions
  const { cast: responseCast } =
    await neynarClient.lookUpCastByHashOrWarpcastUrl(
      directResponse.cast_hash as string,
      'hash'
    )
  const responseLikes = responseCast.reactions.likes
  const responseRecasts = responseCast.reactions.recasts

  await addDirectReactionsByFids({
    questionId: directQuestion.id,
    responseId: directResponse.id,
    likes: responseLikes,
    recasts: responseRecasts,
    timestamp: responseCast.timestamp,
  })
}

export { addDirectReaction, addDirectReactionsByFids, addDirectResultReactions }
