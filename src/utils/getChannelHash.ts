import { HASH_PAIRS } from './constants'

const getChannelHash = (channelId: string) => {
  return HASH_PAIRS[channelId]
}

export { getChannelHash }
