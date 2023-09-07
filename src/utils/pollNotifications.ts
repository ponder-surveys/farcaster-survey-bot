import {
  NotificationCastMention,
  NotificationCastReply,
} from '@standard-crypto/farcaster-js'
import { farcasterClient } from '../clients/farcaster'

let lastPollTime = Date.now()
let polling = false

const pollNotifications = async (
  handler: (
    notification: NotificationCastMention | NotificationCastReply
  ) => void
) => {
  if (polling) return
  polling = true

  try {
    const notifications = []

    for await (const notification of farcasterClient.fetchMentionAndReplyNotifications()) {
      if (notification.content.cast?.timestamp > lastPollTime) {
        notifications.unshift(notification)
      } else {
        break
      }
    }

    if (notifications.length > 0) {
      lastPollTime = notifications[0].content.cast?.timestamp
      for (const notification of notifications) {
        handler(notification)
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    polling = false
  }
}
export { pollNotifications }
