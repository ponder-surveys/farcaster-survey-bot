import { farcasterClient } from '../clients/farcaster'
import { publishReply } from '../api/casts'
import { addBookmark } from '../api/bookmarks'
import { getDateTag } from '../utils/getDateTag'
import { pollNotifications } from '../utils/pollNotifications'

const processedNotifications = new Set<string>()

setInterval(() => {
  processedNotifications.clear()
}, 10 * 60 * 1000) // Clear set every 10 minutes

const startPolling = (handler: (notification: NeynarNotification) => void) => {
  setInterval(() => pollNotifications(handler), 20 * 1000) // Poll casts every 20 seconds
}

const handleNotification = async (notification: NeynarNotification) => {
  // Check if the notification is a mention and specifically targets '@survey'
  if (
    notification.type !== 'cast-reply' ||
    !notification.text.includes('@survey')
  ) {
    return
  }

  const {
    author: { fid: actorFid, username },
    text,
    hash,
    parentHash,
    parentAuthor,
  } = notification

  // Avoid self-notification and ensure all necessary info is present
  if (
    !username ||
    username.toLowerCase() === 'survey' ||
    !text ||
    !hash ||
    !parentHash ||
    !parentAuthor ||
    parentAuthor.username.toLowerCase() === 'survey'
  ) {
    return
  }

  // Check if we haven't processed this notification
  if (processedNotifications.has(hash)) {
    return
  }

  processedNotifications.add(hash)

  // Construct the reply message
  const reply = `🗳️ This cast has been tagged as a potential weekly survey! If viable, it will be voted on this Sunday, then launched on Monday. Follow me to see the results.\n\nWant to help decide? Come vote with us: https://t.me/+QdtIIDi8uzZlNTcx`

  if (process.env.NODE_ENV === 'production') {
    const parentCast = await farcasterClient.v2.fetchCast(parentHash)

    await addBookmark({
      comment: text.replace('@survey', '').trim(),
      cast_hash: parentHash,
      cast_text: parentCast?.text as string,
      cast_author_username: parentAuthor.username,
      cast_author_fid: Number(parentAuthor.fid),
      referred_by_fid: actorFid,
    })

    await publishReply(reply, hash, actorFid)
  } else {
    console.log(`${getDateTag()} Mock reply:\n${reply}`)
  }
}

const replyToMentions = async () => {
  startPolling((notification: NeynarNotification) =>
    handleNotification(notification)
  )
}

export { replyToMentions }
