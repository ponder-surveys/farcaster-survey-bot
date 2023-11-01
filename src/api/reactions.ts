import { supabaseClient } from '../clients/supabase'
import { farcasterClient } from '../clients/farcaster'
import { getUserId } from './users'
import { getDateTag } from '../utils/getDateTag'

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
    console.log(
      `${getDateTag()} Mock ${type} for user ${userId} on question ${questionId}${
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
      console.warn(
        `${getDateTag()} Duplicate reaction detected for user ${userId} on question ${questionId} with type ${type}. Skipping.`
      )
    } else {
      console.error(`${getDateTag()} Error inserting reaction: `, error)
    }
  }
}

const addReactionsByFids = async ({
  questionId,
  responseId = null,
  likes,
  recasts,
  timestamp,
}: {
  questionId: number
  responseId?: number | null
  likes: NeynarReaction[]
  recasts: NeynarReaction[]
  timestamp: string
}) => {
  // Add likes
  likes.forEach(async (like) => {
    const reactor = await farcasterClient.v1.lookupUserByFid(Number(like.fid))
    const reactorUserId = await getUserId(reactor as unknown as NeynarUser)
    await addReaction({
      userId: reactorUserId,
      questionId: questionId,
      responseId: responseId,
      type: 'like',
      createdAt: timestamp,
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
  })

  // Add recasts
  recasts.forEach(async (recast) => {
    const reactor = await farcasterClient.v1.lookupUserByFid(Number(recast.fid))
    const reactorUserId = await getUserId(reactor as unknown as NeynarUser)
    await addReaction({
      userId: reactorUserId,
      questionId: questionId,
      responseId: responseId,
      type: 'recast',
      createdAt: timestamp,
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
  })
}

const addResultReactions = async (
  question: Question,
  responses: QuestionResponse[]
) => {
  // Add question reactions
  const questionCast = (await farcasterClient.v2.fetchCast(
    question.cast_hash as string
  )) as any // Temporary fix for farcaster-js-neynar Cast not having reactions or recasts

  const questionLikes = questionCast.reactions.likes
  const questionRecasts = questionCast.reactions.recasts

  await addReactionsByFids({
    questionId: question.id,
    likes: questionLikes,
    recasts: questionRecasts,
    timestamp: questionCast.timestamp,
  })

  // Add response reactions
  for (const response of responses) {
    const responseCast = (await farcasterClient.v2.fetchCast(
      response.cast_hash as string
    )) as any // Temporary fix for farcaster-js-neynar Cast not having reactions or recasts

    const responseLikes = responseCast.reactions.likes
    const responseRecasts = responseCast.reactions.recasts

    await addReactionsByFids({
      questionId: question.id,
      responseId: response.id,
      likes: responseLikes,
      recasts: responseRecasts,
      timestamp: responseCast.timestamp,
    })
  }
}

export { addReaction, addReactionsByFids, addResultReactions }
