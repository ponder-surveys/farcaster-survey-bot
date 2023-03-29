const formatQuestion = (question: Question) => {
  const {
    title,
    option_1,
    option_2,
    option_3,
    option_4,
    option_5,
    author,
    image_url,
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

  const by = author ? `\n\nQuestion by @${author}` : ''

  const image = `\n${image_url}` || ''

  return `${title}\n\n${options}${by}${image}`
}

const formatReply = () => {
  const title = 'When submitting your vote:'
  const options = `✅ put your option # first\n✅ add additional comments after your chosen #`

  return process.env.NEXT_QUESTION_REPLY || `${title}\n\n${options}`
}

export { formatQuestion, formatReply }
