import { buildSupabaseClient } from '../clients/supabase'
import { buildFarcasterClient } from '../clients/farcaster'
import { formatQuestion, formatReply } from '../utils/formatQuestion'

const getNextQuestion = async (): Promise<Question> => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .is('cast_hash', null)
    .order('id', { ascending: true })
    .limit(1)

  if (error) {
    console.error(error)
    throw new Error(error.message)
  }

  const question = data[0] as Question
  return question
}

const publishNextQuestion = async () => {
  const question = await getNextQuestion()
  const formattedQuestion = formatQuestion(question)
  const formattedReply = formatReply()

  if (process.env.NODE_ENV === 'production') {
    const supabase = buildSupabaseClient()
    const farcaster = buildFarcasterClient()

    const cast = await farcaster.publishCast(formattedQuestion)
    await farcaster.publishCast(formattedReply, cast)
    console.log(`Cast published successfully:\n\n${cast.hash}`)

    const { error } = await supabase
      .from('questions')
      .update({ cast_hash: cast.hash })
      .eq('id', question.id)

    if (error) {
      console.error(error)
      throw new Error(error.message)
    }
  } else {
    console.log(`Mock cast:\n\n${formattedQuestion}`)
    console.log(`\nMock reply:\n\n${formattedReply}`)
  }
}

export { publishNextQuestion }
