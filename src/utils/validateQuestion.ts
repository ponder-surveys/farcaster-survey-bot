import { getNextQuestion } from '../api/questions'
import { getUsername } from '../api/users'
import { validateQuestionAndResultByteSize } from './byteSize'
import { getDateTag } from './getDateTag'

const validateQuestion = async (type: 'general' | 'channel') => {
  const question = await getNextQuestion(type)

  if (question) {
    console.log(
      `${getDateTag()} Validating ${type} question scheduled in 1 hour...`
    )
  } else {
    console.log(`${getDateTag()} No questions to validate.`)
    return
  }

  const username = await getUsername(question.user_id)
  validateQuestionAndResultByteSize(question, username)
}

export { validateQuestion }
