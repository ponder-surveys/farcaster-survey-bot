import logger from 'utils/logger'
import { supabaseClient } from '../clients/supabase'
import { endPoll } from '../services/endPoll'
import { endPredictivePoll } from '../services/endPredictivePoll'
import { fetchBounty } from '../services/supabase'
import { Poll } from '../types/polls'
import getErrorMessage from '../utils/getErrorMessage'

const getNextResults = async (): Promise<Question[]> => {
  const currentTime = new Date()

  const { data, error } = await supabaseClient
    .from('questions')
    .select('*')
    .eq('status', 'posted')
    .lte('expires_at', currentTime.toISOString())
    .order('id', { ascending: true })

  if (error) {
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
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
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
  }

  const bountyId = poll.bounty_id
  if (bountyId) {
    const bounty = await fetchBounty(poll.bounty_id)

    if (
      bounty.id &&
      poll.status === 'calculated' &&
      bounty.status === 'active'
    ) {
      try {
        await endPoll(poll, bounty)
      } catch (error) {
        throw new Error(getErrorMessage(error))
      }
    }
  }

  logger.info(`Question status successfully updated on db`)
}

const getExpiredPredictivePolls = async (): Promise<Poll[]> => {
  const now = new Date().toISOString()

  const { data, error } = await supabaseClient
    .from('questions')
    .select('*')
    .eq('status', 'posted')
    .eq('poll_type', 'predictive')
    .lte('expires_at', now)
    .order('id', { ascending: true })

  if (error) {
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
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
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
  }

  if (poll.bounty_id) {
    const bounty = await fetchBounty(poll.bounty_id)

    if (
      bounty.id &&
      poll.status === 'calculated' &&
      bounty.status === 'active'
    ) {
      try {
        await endPredictivePoll(poll, bounty)
      } catch (error) {
        throw new Error(getErrorMessage(error))
      }
    }
  }

  logger.info(`Question status successfully updated on db`)
}

export {
  getExpiredPredictivePolls,
  getNextResults,
  updateNextResult,
  updatePredictivePollResult,
}
