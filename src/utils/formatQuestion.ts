const formatQuestion = (question: Question, username: string | null) => {
  const { inspired_by } = question

  const by = username
    ? `Question ${
        inspired_by ? 'inspired ' : ''
      }by @${username} - Live for 48 hours`
    : ''

  return `${by}\n\n${process.env.NEXT_QUESTION_INFO}`
}

const formatReply = () => {
  return `${process.env.NEXT_QUESTION_REPLY}\n\n${process.env.CALL_TO_ACTION}`
}

export { formatQuestion, formatReply }
