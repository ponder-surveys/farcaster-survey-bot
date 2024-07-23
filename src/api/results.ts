import {
  EDGE_FUNCTIONS_SECRET_TOKEN,
  EDGE_FUNCTIONS_SERVER_URL,
} from 'utils/constants'
import getErrorMessage from 'utils/getErrorMessage'
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
  const { data, error } = await supabaseClient
    .from('questions')
    .update({
      status: 'calculated',
    })
    .eq('id', questionId)
    .select()

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  if (!EDGE_FUNCTIONS_SECRET_TOKEN) {
    throw new Error('EDGE_FUNCTIONS_SECRET_TOKEN not found')
  }
  const fetchUrl = `${EDGE_FUNCTIONS_SERVER_URL}/complete-survey`
  const record = data[0]

  // Call complete-survey edge function
  if (
    record.bounty &&
    record.status === 'calculated' &&
    record.bounty.status === 'active'
  ) {
    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-secret-token': EDGE_FUNCTIONS_SECRET_TOKEN,
        },
        body: JSON.stringify(record),
      })

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  console.log(`${getDateTag()} Question status successfully updated on db`)
}

export { getNextResults, updateNextResult }
