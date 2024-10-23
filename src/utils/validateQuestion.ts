import { getNextQuestion } from '../api/questions'
import { getUsername } from '../api/users'
import { validateQuestionAndResultByteSize } from './byteSize'
import logger from './logger'

const validateQuestion = async (type: QuestionType) => {
  const question = await getNextQuestion(type)

  if (question) {
    logger.info(`Validating ${type} question scheduled in 1 hour...`)
  } else {
    logger.info(`No questions to validate.`)
    return
  }

  const username = await getUsername(question.user_id)
  validateQuestionAndResultByteSize(question, username)
}

export { validateQuestion }
