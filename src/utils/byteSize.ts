import { MAX_BYTE_SIZE, MOCK_IMGUR_URL } from './constants'
import { formatQuestion } from './formatQuestion'
import { formatResult } from './formatResult'

const calculateByteSize = (text: string) => {
  const buffer = Buffer.from(text, 'utf-8')
  return buffer.byteLength
}

const validateByteSize = async (question: Question) => {
  // Validate question (estimate)
  const formattedQuestion = formatQuestion(question)
  const formattedQuestionSize = calculateByteSize(formattedQuestion)

  if (formattedQuestionSize >= MAX_BYTE_SIZE) {
    console.warn(
      `Warning: Question cast may be too large (${formattedQuestionSize}/${MAX_BYTE_SIZE} bytes).\nPlease consider modifying the question in the next 24 hours.`
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
  const formattedResult = formatResult(question, mockOptionCounts, 55) // Using magic numbers for option counts
  const mockChartUrl = MOCK_IMGUR_URL
  const response = `${formattedResult}\n${mockChartUrl}`
  const responseSize = calculateByteSize(response)

  if (responseSize >= MAX_BYTE_SIZE) {
    console.warn(
      `Warning: Result cast may be too large (${responseSize}/${MAX_BYTE_SIZE} bytes).\nPlease consider modifying the question in the next 24 hours.`
    )
    return
  }

  console.log(
    `Next question is estimated to be valid (question: ${formattedQuestionSize}/${MAX_BYTE_SIZE} bytes, result: ${responseSize}/${MAX_BYTE_SIZE} bytes)`
  )
}

export { calculateByteSize, validateByteSize }
