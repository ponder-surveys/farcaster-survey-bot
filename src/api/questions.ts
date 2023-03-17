import { buildSupabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextQuestion = async (): Promise<Question> => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .is('cast_hash', null)
    .order('id', { ascending: true })
    .limit(1)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const question = data[0] as Question
  return question
}

const updateNextQuestionHash = async (hash: string, questionId: number) => {
  const supabase = buildSupabaseClient()

  const { error } = await supabase
    .from('questions')
    .update({ cast_hash: hash })
    .eq('id', questionId)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(`${getDateTag()} Question cast hash successfully updated on db`)
}

export { getNextQuestion, updateNextQuestionHash }
