const formatDirectResult = () => {
  const top =
    '🌟 Well done! Your reward has been unlocked. Where would you like to redeem it?'

  const options = [
    '1. Your connected wallet',
    `2. Half to you, half to ${process.env.DIRECT_QUESTION_DONATION_LABEL}`,
    `3. Donate fully to ${process.env.DIRECT_QUESTION_DONATION_LABEL}`,
  ].join('\n')

  const bottom =
    'Just type the number and the reward will automatically be sent.'

  return `${top}\n\n${options}\n\n${bottom}`
}

const formatDirectReply = () =>
  '🌟 Got it! Your response was recorded and the reward will be delivered shortly.'

const formatDirectError = () =>
  '⚠️ Something went wrong! Please reach our to @ba or @cojo.eth for help.'

export { formatDirectResult, formatDirectReply, formatDirectError }
