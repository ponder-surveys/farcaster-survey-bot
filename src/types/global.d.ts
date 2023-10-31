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

interface Reaction {
  id?: number
  user_id: number
  question_id: number
  response_id: number | null
  type: 'like' | 'recast'
  created_at: string
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
  author_user_id: number
  referred_by_user_id: number
  username?: string
}

interface User {
  id: number
  fid: number
  username: string
  eth_address?: string | null
}

interface NeynarUser {
  fid: number
  custodyAddress?: string
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
  parentAuthor: { fid: string; username: string }
  author: NeynarUser
  text: string
  timestamp: string
  embeds: any[]
  mentionedProfiles: NeynarUser[]
  type: string
  reactions: { count: number; fids: number[] }
  recasts: { count: number; fids: number[] }
  recasters: any[]
  viewerContext: { liked: boolean; recasted: boolean }
  replies: { count: number }
  threadHash: null | string
}

interface NeynarReaction {
  fid: number
}
