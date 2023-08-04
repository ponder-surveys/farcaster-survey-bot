import { getNextQuestions } from '../api/questions'
import { validateByteSize } from './byteSize'
import { getDateTag } from './getDateTag'

const validateQuestions = async (type: 'general' | 'channel') => {
  console.log(
    `${getDateTag()} Validating ${type} questions scheduled in 24 hours...`
  )

  const questions = await getNextQuestions(type)
  for (const question of questions) {
    validateByteSize(question)
  }
}

export { validateQuestions }
