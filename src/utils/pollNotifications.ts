import { neynarClient } from '../clients/neynar'

let lastPollTime = Date.now()
let polling = false

const pollNotifications = async (
  fid: number,
  handler: (notification: NeynarNotification) => void
) => {
  if (polling) return
  polling = true

  try {
    const notifications = []
    const data = await neynarClient.fetchMentionAndReplyNotifications(fid)
    const notifs = data.result.notifications

    for (const notification of notifs) {
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
