import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

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
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
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
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(
    `${getDateTag()} Q&A question status successfully updated for ${questionId}`
  )
}

interface BountyReward {
  amount: number
}

const getQuestionBountyAmount = async (questionId: string) => {
  const { data, error } = await supabaseClient
    .from('questions_qual_bounties')
    .select(
      'id, token_amount, token_name, questions_qual_bounty_rewards(amount)'
    )
    .eq('question_id', questionId)
    .limit(1)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  if (data && data.length > 0) {
    const bounty = data[0]
    let totalRewards = 0

    if (Array.isArray(bounty.questions_qual_bounty_rewards)) {
      totalRewards = bounty.questions_qual_bounty_rewards.reduce(
        (sum, reward: BountyReward) => sum + (reward.amount || 0),
        0
      )
    } else if (
      bounty.questions_qual_bounty_rewards &&
      typeof bounty.questions_qual_bounty_rewards === 'object' &&
      'amount' in bounty.questions_qual_bounty_rewards
    ) {
      totalRewards =
        (bounty.questions_qual_bounty_rewards as BountyReward).amount || 0
    }

    const amount = bounty.token_amount - totalRewards
    return { amount, tokenName: bounty.token_name }
  }

  return { amount: 0, tokenName: '' }
}

export { getNextQuestionsQual, updateNextQuestionQual, getQuestionBountyAmount }
