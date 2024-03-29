import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getResponses = async (question_id: number) => {
  const { data, error } = await supabaseClient
    .from('responses')
    .select('*')
    .eq('question_id', question_id)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
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
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }
}

const addResponses = async (responses: QuestionResponse[]) => {
  const { data, error } = await supabaseClient
    .from('responses')
    .upsert(responses, { onConflict: 'id' })
    .select('*')

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(`${getDateTag()} Responses successfully uploaded on db`)

  return data as QuestionResponse[]
}

export { getResponses, updateResponse, addResponses }
