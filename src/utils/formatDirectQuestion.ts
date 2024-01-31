const formatDirectQuestion = (
  directQuestion: DirectQuestion,
  recipientUsername: string | null,
  authorUsername: string | null
) => {
  const { question, bounty_value, bounty_type } = directQuestion

  const forUser = `💭 Question for @${recipientUsername}`
  const reward = `🎁 Reward ${bounty_value} ${bounty_type}`
  const by = `🎯 By ${authorUsername ? `@${authorUsername}` : 'anon'}`

  return `${forUser}\n\n${question}\n\n${reward}\n${by}`
}

const formatDirectReply = () => {
  return `${process.env.NEXT_DIRECT_QUESTION_REPLY}`
}

export { formatDirectQuestion, formatDirectReply }
