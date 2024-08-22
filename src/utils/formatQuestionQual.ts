const formatReplyToQuestionQual = (
  responseCount: number,
  numBounties: number,
  tokenName: string
): string => {
  const updateInterval = Number(
    process.env.NEXT_QUESTION_QUAL_UPDATE_INTERVAL_HOURS || 24
  ) // Default to 24 hours if not set

  const msg = `💭 Your question got ${responseCount} responses${
    numBounties
      ? ` and you still have ${numBounties} ${tokenName} in bounties to award`
      : ''
  } after ${updateInterval} hours.

Reward responses directly in the frame. You can also read all of them here:`

  return msg
}

export { formatReplyToQuestionQual }
