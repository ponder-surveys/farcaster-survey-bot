const formatReplyToQuestionQual = (responseCount: number): string => {
  const updateInterval = Number(
    process.env.NEXT_QUESTION_QUAL_UPDATE_INTERVAL_HOURS || 24
  ) // Default to 24 hours if not set
  return `💭 Your question got ${responseCount} responses after ${updateInterval} hours. Read them all here:`
}

export { formatReplyToQuestionQual }
