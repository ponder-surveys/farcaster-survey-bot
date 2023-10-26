import { farcasterClient } from '../clients/farcaster'

let lastPollTime = Date.now()
let polling = false

const pollNotifications = async (
  handler: (
    notification: NeynarNotification
  ) => void
) => {
  if (polling) return
  polling = true

  try {
    const notifications = []
    const fid = Number(process.env.FARCASTER_FID)

    for await (const notification of farcasterClient.v1.fetchMentionAndReplyNotifications(fid)) {
      if (Number(notification.timestamp) > lastPollTime) {
        notifications.unshift(notification)
      } else {
        break
      }
    }

    if (notifications.length > 0) {
      lastPollTime = Number(notifications[0].timestamp)
      for (const notification of notifications) {
        handler(notification as any)
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    polling = false
  }
}
export { pollNotifications }
