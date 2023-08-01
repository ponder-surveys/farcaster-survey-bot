import { buildSupabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextResults = async (): Promise<Question[]> => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('status', 'posted')
    .order('id', { ascending: false })

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const questions = data as Question[]
  return questions
}

const updateNextResult = async (questionId: number) => {
  const supabase = buildSupabaseClient()

  const { error } = await supabase
    .from('questions')
    .update({
      status: 'calculated',
    })
    .eq('id', questionId)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(
    `${getDateTag()} Question status successfully updated on db`
  )
}

export { getNextResults, updateNextResult }
