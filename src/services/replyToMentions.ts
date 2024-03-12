import { publishReply } from '../api/casts'
import { CREATE_SURVEY_FRAME_URL } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'
import { pollNotifications } from '../utils/pollNotifications'

const processedNotifications = new Set<string>()

setInterval(() => {
  processedNotifications.clear()
}, 10 * 60 * 1000) // Clear set every 10 minutes

const startPolling = (
  fid: number,
  handler: (notification: NeynarNotification) => void
) => {
  setInterval(() => pollNotifications(fid, handler), 20 * 1000) // Poll casts every 20 seconds
}

const handleNotification = async (
  fid: number,
  username: string,
  signer: string,
  notification: NeynarNotification
) => {
  // Check if the notification is a mention and specifically targets username
  if (
    notification.type !== 'cast-mention' ||
    !notification.text.includes(`@${username}`)
  ) {
    return
  }

  const { author, hash, parentHash, parentAuthor } = notification

  // Avoid self-notification and ensure all necessary info is present
  if (
    !author.username ||
    author.fid === fid ||
    Number(parentAuthor.fid) === fid ||
    !hash ||
    !parentHash ||
    !parentAuthor
  ) {
    return
  }

  // Check if we haven't processed this notification
  if (processedNotifications.has(hash)) {
    return
  }

  processedNotifications.add(hash)

  // Construct the reply message
  const reply = `🗳️ Time for a Quick Poll? Start by entering your question below.`

  if (process.env.NODE_ENV === 'production') {
    await publishReply(
      `build-a-poll reply from @${username}`,
      hash,
      reply,
      CREATE_SURVEY_FRAME_URL,
      undefined,
      signer
    )
  } else {
    console.log(`${getDateTag()} Mock reply:\n${reply}`)
  }
}

const replyToMentions = async (
  fid: number,
  username: string,
  signer: string
) => {
  startPolling(fid, (notification: NeynarNotification) =>
    handleNotification(fid, username, signer, notification)
  )
}

export { replyToMentions }
