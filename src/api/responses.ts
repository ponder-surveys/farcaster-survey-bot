import getErrorMessage from 'utils/getErrorMessage'
import logger from 'utils/logger'
import { supabaseClient } from '../clients/supabase'

const getResponses = async (question_id: number) => {
  const { data, error } = await supabaseClient
    .from('responses')
    .select('*')
    .eq('question_id', question_id)

  if (error) {
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
  }

  return data as QuestionResponse[]
}

const updateResponse = async (
  userId: number,
  questionId: number,
  comment: string,
  castHash: string
) => {
  const { error } = await supabaseClient
    .from('responses')
    .update({
      comment: comment,
      cast_hash: castHash,
    })
    .match({ user_id: userId, question_id: questionId })

  if (error) {
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
  }
}

const addResponses = async (responses: QuestionResponse[]) => {
  const { data, error } = await supabaseClient
    .from('responses')
    .upsert(responses, { onConflict: 'id' })
    .select('*')

  if (error) {
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
  }

  logger.info(`Responses successfully uploaded on db`)

  return data as QuestionResponse[]
}

export { addResponses, getResponses, updateResponse }
