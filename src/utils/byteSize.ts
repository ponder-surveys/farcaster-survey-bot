import { MAX_BYTE_SIZE } from './constants'
import { formatQuestion } from './formatQuestion'
import { formatResult } from './formatResult'

const calculateByteSize = (text: string) => {
  const buffer = Buffer.from(text, 'utf-8')
  return buffer.byteLength
}

const validateQuestionAndResultByteSize = async (
  question: Question,
  username: string | null
) => {
  // Validate question (estimate)
  const formattedQuestion = formatQuestion(question, username)
  const formattedQuestionSize = calculateByteSize(formattedQuestion)

  if (formattedQuestionSize >= MAX_BYTE_SIZE) {
    console.warn(
      `Warning: Question cast may be too large (${formattedQuestionSize}/${MAX_BYTE_SIZE} bytes).\nPlease consider modifying the question.`
    )
  }

  // Validate result (estimate)
  const mockOptionCounts: OptionCounts = {
    1: 15,
    2: 10,
    3: 10,
    4: 10,
    5: 10,
  }
  const formattedResult = formatResult(question, username, mockOptionCounts, 55) // Using magic numbers for option counts
  const responseSize = calculateByteSize(formattedResult)

  if (responseSize >= MAX_BYTE_SIZE) {
    console.warn(
      `Warning: Result cast may be too large (${responseSize}/${MAX_BYTE_SIZE} bytes).\nPlease consider modifying the question.`
    )
    return
  }

  console.log(
    `Next question is estimated to be valid (question: ${formattedQuestionSize}/${MAX_BYTE_SIZE} bytes, result: ${responseSize}/${MAX_BYTE_SIZE} bytes)`
  )
}

export { calculateByteSize, validateQuestionAndResultByteSize }
