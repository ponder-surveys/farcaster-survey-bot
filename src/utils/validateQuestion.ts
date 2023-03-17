import { getNextQuestion } from '../api/questions'
import { validateByteSize } from './byteSize'
import { getDateTag } from './getDateTag'

const validateQuestion = async () => {
  console.log(`${getDateTag()} Validating question scheduled in 24 hours...`)

  const question = await getNextQuestion()
  validateByteSize(question)
}

export { validateQuestion }
