import { publishCast } from '../api/casts'
import { getNextQuestion, updateNextQuestionHash } from '../api/questions'
import { formatQuestion, formatReply } from '../utils/formatQuestion'
import { calculateByteSize } from '../utils/byteSize'
import { MAX_BYTE_SIZE } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'

const publishNextQuestion = async () => {
  const question = await getNextQuestion()
  const formattedQuestion = formatQuestion(question)
  const formattedReply = formatReply()

  const questionByteSize = calculateByteSize(formattedQuestion)
  if (questionByteSize >= MAX_BYTE_SIZE) {
    console.error(
      `${getDateTag()} Error: Question is too large to publish.\nSize: ${questionByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
    )
    throw new Error(
      `Question too large (${questionByteSize}/${MAX_BYTE_SIZE} bytes).`
    )
  }

  const replyByteSize = calculateByteSize(formattedReply)
  if (replyByteSize >= MAX_BYTE_SIZE) {
    console.error(
      `${getDateTag()} Error: Reply is too large to publish.\nSize: ${replyByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
    )
    throw new Error(
      `Reply too large (${replyByteSize}/${MAX_BYTE_SIZE} bytes).`
    )
  }

  if (process.env.NODE_ENV === 'production') {
    const { hash } = await publishCast(
      'question',
      formattedQuestion,
      formattedReply
    )
    updateNextQuestionHash(hash, question.id)
  } else {
    console.log(`${getDateTag()} Mock cast:\n\n${formattedQuestion}`)
    console.log(`${getDateTag()} Mock reply:\n\n${formattedReply}`)
  }
}

export { publishNextQuestion }
