import { supabaseClient } from '../clients/supabase'

const getAnswersCount = async (questionId: string) => {
  const { count, error } = await supabaseClient
    .from('answers_qual')
    .select('*', { count: 'exact', head: true })
    .eq('question_id', questionId)

  if (error) {
    console.error('Error fetching Q&A answer count:', error)
    return 0
  }

  return count || 0
}

export { getAnswersCount }
