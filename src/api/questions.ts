import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextQuestion = async (
  type: QuestionType
): Promise<Question | null> => {
  let query = supabaseClient
    .from('questions')
    .select('*')
    .eq('status', 'pending')
    .order('id', { ascending: true })
    .limit(1)

  const COMMUNITY_USER_ID = parseInt(process.env.COMMUNITY_USER_ID as string)

  switch (type) {
    case 'general':
      query = query
        .neq('user_id', COMMUNITY_USER_ID)
        .eq('expedited', false)
      break
    case 'community':
      query = query
        .eq('user_id', COMMUNITY_USER_ID)
        .eq('expedited', false)
      break
    case 'expedited':
      query = query.eq('expedited', true)
      break
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
