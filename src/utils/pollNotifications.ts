import { farcasterClient } from '../clients/farcaster'

let lastPollTime = Date.now()
let polling = false

const pollNotifications = async (
  handler: (notification: NeynarNotification) => void
) => {
  if (polling) return
  polling = true

  try {
    const notifications = []
    const fid = Number(process.env.FARCASTER_FID)

    for await (const notification of farcasterClient.v1.fetchMentionAndReplyNotifications(
      fid
    )) {
      const notificationTime = new Date(notification.timestamp).getTime()
      if (notificationTime > lastPollTime) {
        notifications.unshift(notification)
      } else {
        break
      }
    }

    if (notifications.length > 0) {
      lastPollTime = new Date(notifications[0].timestamp).getTime()
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
