const formatDirectQuestion = (
  directQuestion: DirectQuestion,
  recipientUsername: string | null,
  authorUsername: string | null
) => {
  const { question, bounty_value, bounty_type } = directQuestion

  const forUser = `💭 Question for @${recipientUsername}`
  const reward = `🎁 Reward: ${bounty_value} ${bounty_type} by ${
    authorUsername ? `@${authorUsername}` : 'anon'
  }`

  return `${question}\n\n${forUser}\n${reward}`
}

const formatDirectReply = () => {
  return `${process.env.NEXT_DIRECT_QUESTION_REPLY}`
}

export { formatDirectQuestion, formatDirectReply }
