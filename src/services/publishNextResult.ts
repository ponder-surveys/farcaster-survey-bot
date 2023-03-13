import { buildSupabaseClient } from '../clients/supabase'
import { buildFarcasterClient } from '../clients/farcaster'
import { validateResponse } from '../utils/validateResponse'
import { createChart } from '../utils/createChart'
import { formatResult } from '../utils/formatResult'

const getNextResult = async (): Promise<Question> => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .not('cast_hash', 'eq', null)
    .order('id', { ascending: false })
    .limit(1)

  if (error) {
    console.error(error)
    throw new Error(error.message)
  }

  const question = data[0] as Question
  return question
}

const getResponses = async (question_id: number) => {
  const supabase = buildSupabaseClient()

  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('question_id', question_id)

  if (error) {
    console.error(error)
    throw new Error(error.message)
  }

  return data as Res[]
}

const publishNextResult = async () => {
  const result = await getNextResult()

  if (!result.cast_hash) {
    throw Error('Error retrieving cast hash')
  }

  const farcaster = buildFarcasterClient()
  const castIterator = await farcaster.fetchCastsInThread({
    hash: result.cast_hash,
  })

  if (!castIterator) {
    throw Error('Error retrieving cast replies')
  }

  const responses: Res[] = []
  const optionCounts: OptionCounts = {}

  // Populate option counts
  for (let i = 1; i <= 5; i++) {
    if (result[`option_${i}` as keyof Question]) {
      optionCounts[i] = 0
    }
  }

  for await (const cast of castIterator) {
    const match = validateResponse(cast.text)

    if (match) {
      const selected_option = Number(match[1])
      const comment = match[2] !== undefined ? match[2].trim() : ''

      responses.push({
        question_id: result.id,
        selected_option,
        comment,
        fid: cast.author.fid,
      })
      optionCounts[selected_option]++
    }
  }

  const extraResponses = await getResponses(result.id)
  for (const extraResponse of extraResponses) {
    const optionIndex = extraResponse.selected_option
    if (optionCounts[optionIndex]) {
      optionCounts[optionIndex]++
    } else {
      optionCounts[optionIndex] = 1
    }
  }

  const totalResponses = responses.length + extraResponses.length
  const formattedResult = formatResult(result, optionCounts, totalResponses)
  const chartUrl = await createChart(result.id, optionCounts, totalResponses)

  if (process.env.NODE_ENV === 'production') {
    const supabase = buildSupabaseClient()
    const farcaster = buildFarcasterClient()

    const cast = await farcaster.publishCast(`${formattedResult}\n${chartUrl}`)
    console.log(`Result published successfully:\n${cast.hash}`)

    const { error } = await supabase.from('responses').upsert(responses)

    if (error) {
      console.error(error)
      throw new Error(error.message)
    }
  } else {
    console.log(`Mock result:\n\n${formattedResult}\n${chartUrl}`)
  }
}

export { publishNextResult }
