import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getNextDirectQuestion = async (): Promise<DirectQuestion | null> => {
  const { data, error } = await supabaseClient
    .from('direct_questions')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  const directQuestion = data ? (data[0] as DirectQuestion) : null
  return directQuestion
}

const updateNextDirectQuestion = async (
  hash: string,
  questionId: number,
  updatedAt: string
) => {
  const { error } = await supabaseClient
    .from('direct_questions')
    .update({
      cast_hash: hash,
      updated_at: updatedAt,
      status: 'POSTED',
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

export { getNextDirectQuestion, updateNextDirectQuestion }
