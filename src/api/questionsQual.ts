import getErrorMessage from 'utils/getErrorMessage'
import logger from 'utils/logger'
import { supabaseClient } from '../clients/supabase'

const getNextQuestionsQual = async (): Promise<QuestionQual[]> => {
  const updateInterval = Number(
    process.env.NEXT_QUESTION_QUAL_UPDATE_INTERVAL_HOURS || 24
  ) // Default to 24 hours if not set

  const currentTime = new Date()
  const cutoffTime = new Date(
    currentTime.getTime() - updateInterval * 60 * 60 * 1000
  )

  const { data, error } = await supabaseClient
    .from('questions_qual')
    .select('id, cast_hash, created_at, is_updated')
    .eq('source', 'form')
    .lte('created_at', cutoffTime.toISOString())
    .eq('is_updated', false)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error(`Error fetching next Q&A question: ${getErrorMessage(error)}`)
    throw new Error(getErrorMessage(error))
  }

  return data as QuestionQual[]
}

const updateNextQuestionQual = async (questionId: string) => {
  const { error } = await supabaseClient
    .from('questions_qual')
    .update({
      is_updated: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', questionId)
    .select()

  if (error) {
    logger.error(
      `Error updating Q&A question status for ${questionId}: ${getErrorMessage(
        error
      )}`
    )
    throw new Error(getErrorMessage(error))
  }

  logger.info(`Q&A question status successfully updated for ${questionId}`)
}

const getQuestionBountyAmount = async (questionId: string) => {
  const { data, error } = await supabaseClient
    .from('questions_qual')
    .select(
      `
      id,
      bounty:bounties!questions_qual_bounty_id_fkey (
        id,
        token_amount,
        token:tokens (
          name
        ),
        bounty_rewards (
          amount
        )
      )
    `
    )
    .eq('id', questionId)
    .limit(1)
    .single()

  if (error) {
    logger.error(
      `Error fetching question bounty amount for ${questionId}: ${getErrorMessage(
        error
      )}`
    )
    throw new Error(getErrorMessage(error))
  }

  if (data && data.bounty) {
    const bounty = Array.isArray(data.bounty)
      ? data.bounty[0]
      : (data.bounty as {
          id: string
          token_amount: number
          token: { name: string }[] | { name: string } | null
          bounty_rewards: { amount: number }[] | null
        })

    let totalRewards = 0

    if (Array.isArray(bounty.bounty_rewards)) {
      totalRewards = bounty.bounty_rewards.reduce<number>(
        (sum, reward) => sum + (reward.amount || 0),
        0
      )
    }

    const amount = bounty.token_amount - totalRewards
    const tokenName = Array.isArray(bounty.token)
      ? bounty.token[0]?.name || ''
      : bounty.token?.name || ''
    return { amount, tokenName }
  }

  return { amount: 0, tokenName: '' }
}

export { getNextQuestionsQual, getQuestionBountyAmount, updateNextQuestionQual }
