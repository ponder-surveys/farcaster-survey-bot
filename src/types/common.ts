type BountyStatus = 'active' | 'completed'

// TODO: Remember to update 'survey' to 'poll' here as well as on the database
export type BountyContent = 'survey' | 'q&a' | 'ama' | 'predictive_poll'

export interface Bounty {
  id: string
  smart_contract_id: number
  token_amount: number
  token_amount_after_fee: number
  status: BountyStatus
  content: BountyContent
  token_id: string
  user_id: string
  fee_basis_points: number
  max_participants: number
  is_sponsored: boolean
  created_at: string
  updated_at: string
  user: User
  token: Token
}

export interface BountyClaim {
  id?: string
  bounty_id: string
  response_id: number
  amount: number
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  created_at: string
  fid: number
  username: string
  holder_address: string | null
  rhid: number | null
  display_name: string | null
  profile_picture: string | null
  connected_addresses: any
  follower_count: number
  power_badge: boolean
  uuid: string
  score: number | null
  amount: number
  sponsored_count: number
  sponsored_count_predictive_poll: number
}

export type UserWithSelectedOption = User & {
  selected_option: number
}

interface Token {
  id: string
  name: string
  standard: string
  chain: string
  address: string
  created_at: string
  updated_at: string
  image_path: string
}
//
// Smart Contracts

export type SmartContractPayload<T extends Record<string, any>> = {
  [K in keyof T]: T[K]
}

export type Web3FunctionArgs = string[]

export type SmartContractFn =
  | 'startPoll'
  | 'endPoll'
  | 'claimBounty_Poll'
  | 'startQuestion'
  | 'endQuestion'
  | 'rewardBounty'
  | 'distributeRewards'
  | 'castVote'

export type EventSignature =
  | 'PollStarted(uint256,address)'
  | 'PollEnded(uint256)'
  | 'RewardClaimed(uint256,address,bool,uint256)'
  | 'QuestionStarted(uint256,address)'
  | 'QuestionEnded(uint256)'
  | 'BountyRewarded(uint256,address,uint256)'
  | 'RewardsDistributed(uint256,address[],uint256)'
  | 'VoteCasted(uint256,address)'
