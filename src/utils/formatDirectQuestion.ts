const formatDirectQuestion = (
  directQuestion: DirectQuestion,
  recipientUsername: string | null,
  authorUsername: string | null
) => {
  const { question, bounty_value, bounty_type } = directQuestion

  const forUser = `For @${recipientUsername}`
  const reward = `Reward ${bounty_value} ${bounty_type}`
  const by = `${authorUsername ? ` by @${authorUsername}` : ''}`

  return `${question}\n\n${forUser}\n${reward}${by}`
}

const formatDirectReply = () => {
  return `${process.env.NEXT_DIRECT_QUESTION_REPLY}`
}

export { formatDirectQuestion, formatDirectReply }
