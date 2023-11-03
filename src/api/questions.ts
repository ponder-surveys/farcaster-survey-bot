import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextQuestion = async (
  type: 'general' | 'channel'
): Promise<Question | null> => {
  let query = supabaseClient
    .from('questions')
    .select('*')
    .eq('status', 'pending')
    .eq('expedited', false)
    .order('id', { ascending: true })
    .limit(1)

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

  const question = data ? (data[0] as Question) : null
  return question
}

const updateNextQuestion = async (
  hash: string,
  questionId: number,
  createdAt: string
) => {
  const { error } = await supabaseClient
    .from('questions')
    .update({
      cast_hash: hash,
      created_at: createdAt,
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

export { getNextQuestion, updateNextQuestion }
