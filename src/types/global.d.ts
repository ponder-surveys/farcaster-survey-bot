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

interface QuestionQual {
  id: string
  channel: string
  text: string
  cast_hash: string
  archived: boolean
  likes_count: number
  recasts_count: number
  featured: boolean
  author: User
  created_at: string
  updated_at: string
  is_anonymous: boolean
  is_updated: boolean
}

type QuestionType = 'general' | 'community' | 'expedited'

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

interface User {
  id: number
  fid: number
  username: string
  holder_address?: string | null
  connected_addresses?: string[]
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

type PonderReaction = {
  id: string
  reactor_id: number
  question_id?: string
  answer_id?: string | null
  cast_type?: 'QUESTION' | 'ANSWER'
  cast_hash?: string
  reaction_type: 'LIKE' | 'RECAST'
  reaction_timestamp: string
  username?: string
  profile_picture?: string
  display_name?: string
  connected_addresses?: string[]
}
