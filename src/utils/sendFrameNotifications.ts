import { neynarClientV2 } from 'clients/neynar'
import { v4 as uuidv4 } from 'uuid'

export async function sendFrameNotifications(targetFids: number[]) {
  await neynarClientV2.publishFrameNotifications({
    targetFids,
    notification: {
      title: 'You won 500 DEGEN',
      body: JSON.stringify('For your correct answer: "White House"'),
      target_url: 'https://localhost:3000/predictive/235',
      uuid: uuidv4(),
    },
  })
}
