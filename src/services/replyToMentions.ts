import { neynarClient } from '../clients/neynar'
import { publishReply } from '../api/casts'
import { getUserId } from '../api/users'
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
    notification.type !== 'cast-mention' ||
    !notification.text.includes('@survey')
  ) {
    return
  }

  const { author, text, hash, parentHash, parentAuthor } = notification

  // Avoid self-notification and ensure all necessary info is present
  if (
    !author.username ||
    author.fid === Number(process.env.FARCASTER_FID) ||
    Number(parentAuthor.fid) === Number(process.env.FARCASTER_FID) ||
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
  const reply = `🗳️ This cast has been tagged as a potential survey topic! If approved, a new survey will be crafted and delivered shortly.\n\nWant to help decide? Come vote with us: https://t.me/+QdtIIDi8uzZlNTcx`

  if (process.env.NODE_ENV === 'production') {
    const { cast: parentCast } =
      await neynarClient.lookUpCastByHashOrWarpcastUrl(parentHash, 'hash')
    const userData = await neynarClient.lookupUserByFid(
      Number(parentAuthor.fid)
    )
    const parentAuthorObj = userData.result.user
    const authorUserId = await getUserId(author)
    const parentAuthorUserId = await getUserId(parentAuthorObj)

    await addBookmark({
      comment: text.replace('@survey', '').trim(),
      cast_hash: parentHash,
      cast_text: parentCast?.text as string,
      author_user_id: parentAuthorUserId,
      referred_by_user_id: authorUserId,
      username: parentAuthorObj?.username,
    })

    await publishReply('bookmark reply', hash, reply)
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
