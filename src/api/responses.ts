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

  return data as Res[]
}

const addResponses = async (responses: Res[]) => {
  const { error } = await supabaseClient.from('responses').upsert(responses)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(`${getDateTag()} Responses successfully uploaded on db`)
}

export { getResponses, addResponses }
