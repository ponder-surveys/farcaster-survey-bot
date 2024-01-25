const formatQuestion = (question: Question, username: string | null) => {
  const {
    title,
    option_1,
    option_2,
    option_3,
    option_4,
    option_5,
    inspired_by,
  } = question

  const optionsData = [
    { option: option_1 },
    { option: option_2 },
    { option: option_3 },
    { option: option_4 },
    { option: option_5 },
  ]

  const options = optionsData
    .filter((o) => o.option)
    .map((o, i) => `${i + 1}. ${o.option}`)
    .join('\n')

  const by = username
    ? `\n\n${inspired_by ? 'Inspired' : 'Question'} by @${username}`
    : ''

  return `${title}\n\n${options}${by}`
}

const formatReply = () => {
  return `${process.env.NEXT_QUESTION_REPLY}\n\n${process.env.CALL_TO_ACTION}`
}

export { formatQuestion, formatReply }
