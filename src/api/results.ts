import { buildSupabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextResult = async (): Promise<Question> => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .not('cast_hash', 'eq', null)
    .order('id', { ascending: false })
    .limit(1)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const question = data[0] as Question

  if (!question.cast_hash) {
    throw new Error(`${getDateTag()} Error retrieving cast hash`)
  }

  return question
}

export { getNextResult }
