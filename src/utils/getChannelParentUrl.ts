import axios from 'axios'

const getChannelParentUrl = async (channelId: string) => {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/neynarxyz/farcaster-channels/main/warpcast.json'
    )
    const channels = response.data

    const channel = channels.find(
      (ch: { channel_id: string }) => ch.channel_id === channelId
    )
    if (channel) {
      return channel.parent_url
    } else {
      throw new Error('Channel not found')
    }
  } catch (error) {
    console.error('Error fetching channel data:', error)
    throw error
  }
}

export { getChannelParentUrl }
