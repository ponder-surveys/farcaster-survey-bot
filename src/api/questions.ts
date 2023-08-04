import { buildSupabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextQuestions = async (
  type: 'general' | 'channel'
): Promise<Question[]> => {
  const supabase = buildSupabaseClient()

  let query = supabase
    .from('questions')
    .select('*')
    .eq('status', 'pending')
    .order('id', { ascending: true })

  if (type === 'general') {
    query = query.is('channel', null)
  } else {
    query = query.not('channel', 'eq', null)
  }

  const { data, error } = await query

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const questions = data as Question[]
  return questions
}

const updateNextQuestion = async (hash: string, questionId: number) => {
  const supabase = buildSupabaseClient()

  const { error } = await supabase
    .from('questions')
    .update({
      cast_hash: hash,
      status: 'posted',
    })
    .eq('id', questionId)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(
    `${getDateTag()} Question status and cast hash successfully updated on db`
  )
}

export { getNextQuestions, updateNextQuestion }
