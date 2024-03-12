import { neynarClient } from '../clients/neynar'

const pollNotifications = async (
  fid: number,
  handler: (notification: NeynarNotification) => void,
  lastPollTime: number,
  polling: boolean
) => {
  if (polling) return
  let newLastPollTime = lastPollTime
  let newPolling = true

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
      newLastPollTime = new Date(notifications[0].timestamp).getTime()
      for (const notification of notifications) {
        handler(notification as any)
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    newPolling = false
  }

  return { newLastPollTime, newPolling }
}

export { pollNotifications }
