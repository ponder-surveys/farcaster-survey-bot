const formatDirectResult = (authorUsername: string | null) => {
  const top = `🌟 Well done! You've successfully answered the question ${
    authorUsername ? `by @${authorUsername} ` : ''
  }and your bounty has been unlocked.`

  const bottom = `Tap on "View bounty" to claim your rewards.`
  return `${top}\n\n${bottom}`
}

const formatDirectQuestionFailed = (authorUsername: string | null) => {
  const top = `⌛️ Time's up! Unfortunately the question ${
    authorUsername ? `by @${authorUsername} ` : ''
  }was not answered in time.`
  const bottom = `The full bounty amount has been returned to the author.`
  return `${top}\n\n${bottom}`
}

export { formatDirectResult, formatDirectQuestionFailed }
