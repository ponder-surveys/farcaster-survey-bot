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

const getQuestionBountyAmount = async (questionId: string) => {
  const { data, error } = await supabaseClient
    .from('questions_qual_bounties')
    .select('bounty_amount:questions_qual_bounty_rewards(amount)')
    .eq('question_id', questionId)
    .single()

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  return data.bounty_amount as BountyAmount
}

export { getNextQuestionsQual, updateNextQuestionQual, getQuestionBountyAmount }

interface BountyAmount {
  amount: number[]
}
