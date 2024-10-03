import { supabaseClient } from '../clients/supabase'
import getErrorMessage from '../utils/getErrorMessage'
import { getDateTag } from '../utils/getDateTag'
import { endPoll } from '../services/endPoll'
import { fetchBounty } from '../services/supabase'
import { Poll } from 'types/polls'
import { endPredictivePoll } from 'services/endPredictivePoll'

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
  const { data: poll, error } = await supabaseClient
    .from('questions')
    .update({
      status: 'calculated',
    })
    .eq('id', questionId)
    .select('*')
    .single()

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const bounty = await fetchBounty(poll.bounty_id)

  if (bounty.id && poll.status === 'calculated' && bounty.status === 'active') {
    try {
      await endPoll(poll, bounty)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  console.log(`${getDateTag()} Question status successfully updated on db`)
}

const getExpiredPredictivePolls = async (): Promise<Poll[]> => {
  const now = Date.now()

  const { data, error } = await supabaseClient
    .from('questions')
    .select('*')
    .eq('status', 'posted')
    .lte('expires_at', now)
    .order('id', { ascending: true })

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  return data
}

const updatePredictivePollResult = async (questionId: number) => {
  const { data: poll, error } = await supabaseClient
    .from('questions')
    .update({
      status: 'calculated',
    })
    .eq('id', questionId)
    .select('*')
    .single()

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const bounty = await fetchBounty(poll.bounty_id)

  if (bounty.id && poll.status === 'calculated' && bounty.status === 'active') {
    try {
      await endPredictivePoll(poll, bounty)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  console.log(`${getDateTag()} Question status successfully updated on db`)
}

export {
  getNextResults,
  updateNextResult,
  getExpiredPredictivePolls,
  updatePredictivePollResult,
}
