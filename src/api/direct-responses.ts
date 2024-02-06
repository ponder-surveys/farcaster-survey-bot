import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const addDirectResponse = async (response: DirectQuestionResponse) => {
  const { data, error } = await supabaseClient
    .from('direct_questions_responses')
    .upsert(response, { onConflict: 'id' })
    .select('*')

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(`${getDateTag()} Direct response successfully uploaded on db`)

  return data[0] as DirectQuestionResponse
}

export { addDirectResponse }
