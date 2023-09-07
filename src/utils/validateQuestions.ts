import { getNextQuestions } from '../api/questions'
import { getUsername } from '../api/users'
import { validateQuestionAndResultByteSize } from './byteSize'
import { getDateTag } from './getDateTag'

const validateQuestions = async (type: 'general' | 'channel') => {
  console.log(
    `${getDateTag()} Validating ${type} questions scheduled in 24 hours...`
  )

  const questions = await getNextQuestions(type)
  for (const question of questions) {
    const username = await getUsername(question.user_id)
    validateQuestionAndResultByteSize(question, username)
  }
}

export { validateQuestions }
