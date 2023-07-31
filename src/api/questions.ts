import { buildSupabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextQuestions = async (): Promise<Question[]> => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .is('cast_hash', null)
    .order('id', { ascending: true })

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const questions = data as Question[]
  return questions
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

export { getNextQuestions, updateNextQuestionHash }
