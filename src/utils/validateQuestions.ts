import { getNextQuestions } from '../api/questions'
import { validateByteSize } from './byteSize'
import { getDateTag } from './getDateTag'

const validateQuestions = async () => {
  console.log(`${getDateTag()} Validating questions scheduled in 24 hours...`)

  const questions = await getNextQuestions()
  for (const question of questions) {
    validateByteSize(question)
  }
}

export { validateQuestions }
