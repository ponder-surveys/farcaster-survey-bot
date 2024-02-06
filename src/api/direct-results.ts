import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextDirectResults = async (): Promise<DirectQuestion[]> => {
  const timeInterval = Number(
    process.env.NEXT_POLL_DIRECT_RESULTS_INTERVAL_HOURS || 48
  ) // Default to 48 hours if not set
  const currentTime = new Date()
  const cutoffTime = new Date(
    currentTime.getTime() - timeInterval * 60 * 60 * 1000
  )

  const { data, error } = await supabaseClient
    .from('direct_questions')
    .select('*')
    .eq('status', 'POSTED')
    .lte('updated_at', cutoffTime.toISOString())
    .order('updated_at', { ascending: true })

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const questions = data as DirectQuestion[]
  return questions
}

const updateNextDirectResult = async (
  questionId: string,
  status: 'ANSWERED' | 'FAILED'
) => {
  const currentTime = new Date()
  const { error } = await supabaseClient
    .from('direct_questions')
    .update({
      status: status,
      updated_at: currentTime.toISOString(),
    })
    .eq('id', questionId)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(
    `${getDateTag()} Direct question status successfully updated on db`
  )
}

export { getNextDirectResults, updateNextDirectResult }
