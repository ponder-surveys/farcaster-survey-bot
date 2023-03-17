import { buildSupabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getResponses = async (question_id: number) => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('question_id', question_id)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  return data as Res[]
}

const updateResponses = async (responses: Res[]) => {
  const supabase = buildSupabaseClient()

  const { error } = await supabase.from('responses').upsert(responses)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(`${getDateTag()} Responses successfully uploaded on db`)
}

export { getResponses, updateResponses }
