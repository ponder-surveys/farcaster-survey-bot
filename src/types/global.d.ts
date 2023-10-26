interface Question {
  id: number
  title: string
  option_1: string
  option_2: string
  option_3?: string
  option_4?: string
  option_5?: string
  image_url?: string
  cast_hash?: string
  channel?: string
  user_id?: number
  inspired_by: boolean
}

interface QuestionResponse {
  id?: number
  question_id: number
  selected_option: number
  comment?: string
  user_id: number
  cast_hash?: string
}

interface OptionCounts {
  [key: number]: number
}

interface HashPairs {
  [key: string]: string
}

interface Bookmark {
  id?: number
  comment?: string
  cast_hash: string
  cast_text: string
  cast_author_username: string
  cast_author_fid: number
  referred_by_fid: number
}

interface User {
  id: number
  fid: number
  username: string
  eth_address?: string | null
}

interface NeynarProfile {
  fid: number
  custodyAddress: string
  username: string
  displayName: string
  pfp: { url: string }
  profile: { bio: { text: string; mentionedProfiles: any[] } }
  followerCount: number
  followingCount: number
  verifications: string[]
  activeStatus: string
}

interface NeynarNotification {
  hash: string
  parentHash: string
  parentUrl: null | string
  parentAuthor: { fid: string, username: string }
  author: NeynarProfile
  text: string
  timestamp: string
  embeds: any[]
  mentionedProfiles: NeynarProfile[]
  type: string
  reactions: { count: number; fids: number[] }
  recasts: { count: number; fids: number[] }
  recasters: any[]
  viewerContext: { liked: boolean; recasted: boolean }
  replies: { count: number }
  threadHash: null | string
}
