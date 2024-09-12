type BountyStatus = 'active' | 'completed'

// TODO: Remember to update 'survey' to 'poll' here as well as on the database
export type BountyContent = 'survey' | 'q&a' | 'ama'

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
}
