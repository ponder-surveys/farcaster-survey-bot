import {
  NotificationCastMention,
  NotificationCastReply,
} from '@standard-crypto/farcaster-js'
import { buildFarcasterClient } from '../clients/farcaster'
import { publishReply } from '../api/casts'
import { addBookmark } from '../api/bookmarks'
import { getDateTag } from '../utils/getDateTag'
import { pollNotifications } from '../utils/pollNotifications'

const processedNotifications = new Set<string>()

setInterval(() => {
  processedNotifications.clear()
}, 10 * 60 * 1000) // Clear set every 10 minutes

const startPolling = (
  handler: (
    notification: NotificationCastMention | NotificationCastReply
  ) => void
) => {
  setInterval(() => pollNotifications(handler), 10 * 1000) // Poll casts every 10 seconds
}

const handleNotification = async (
  notification: NotificationCastMention | NotificationCastReply
) => {
  // Check if mention
  if (
    notification.type !== 'cast-mention' &&
    notification.type !== 'cast-reply'
  ) {
    return
  }

  // Check if there's an actor
  if (!notification.actor) {
    return
  }

  const { username, fid: actorFid } = notification.actor

  // Check if there's a username and it's not a self-notification
  if (!username || username?.toLowerCase() === 'survey') {
    return
  }

  const { text, hash, parentHash, parentAuthor } = notification.content.cast

  // Check if it has text, a hash, a parent hash, and a parent author
  if (!text || !hash || !parentHash || !parentAuthor) {
    return
  }

  // Check if we haven't seen this notification
  if (processedNotifications.has(hash)) {
    return
  }

  processedNotifications.add(hash)

  const reply = `🗳️ This cast has been tagged as a potential weekly survey! If viable, it will be voted on this Sunday, then launched on Monday. Follow me to see the results.\n\nWant to help decide? Come vote with us: https://t.me/+QdtIIDi8uzZlNTcx`
  
  if (process.env.NODE_ENV === 'production') {
    const farcaster = buildFarcasterClient()
    const parentCast = await farcaster.fetchCast(parentHash)

    await addBookmark({
      comment: text.replace('@survey', '').trim(),
      cast_hash: parentHash,
      cast_text: parentCast?.text as string,
      cast_author_username: parentAuthor.username as string,
      cast_author_fid: parentAuthor.fid,
      referred_by_fid: actorFid,
    })

    await publishReply(reply, hash, actorFid)
  } else {
    console.log(`${getDateTag()} Mock reply:\n${reply}`)
  }
}

const replyToMentions = async () => {
  startPolling(
    (notification: NotificationCastMention | NotificationCastReply) =>
      handleNotification(notification)
  )
}

export { replyToMentions }
