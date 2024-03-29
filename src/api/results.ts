import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextResults = async (): Promise<Question[]> => {
  const timeInterval = Number(
    process.env.NEXT_POLL_RESULTS_INTERVAL_HOURS || 48
  ) // Default to 48 hours if not set
  const currentTime = new Date()
  const cutoffTime = new Date(
    currentTime.getTime() - timeInterval * 60 * 60 * 1000
  )

  const { data, error } = await supabaseClient
    .from('questions')
    .select('*')
    .eq('status', 'posted')
    .lte('created_at', cutoffTime.toISOString())
    .order('id', { ascending: true })

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const questions = data as Question[]
  return questions
}

const updateNextResult = async (questionId: number) => {
  const { error } = await supabaseClient
    .from('questions')
    .update({
      status: 'calculated',
    })
    .eq('id', questionId)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(`${getDateTag()} Question status successfully updated on db`)
}

export { getNextResults, updateNextResult }
