const formatDirectResult = (authorUsername: string | null) => {
  const top = `🌟 Well done! You've successfully answered the question ${
    authorUsername ? `by ${authorUsername} ` : ''
  }and your bounty has been unlocked.`

  const bottom = `Tap on "View bounty" to claim your rewards.`
  return `${top}\n\n${bottom}`
}

const formatDirectReply = () =>
  '🌟 Got it! Your response was recorded and the reward will be delivered shortly.'

const formatDirectError = () =>
  '⚠️ Something went wrong! Please reach our to @ba or @cojo.eth for help.'

export { formatDirectResult, formatDirectReply, formatDirectError }
