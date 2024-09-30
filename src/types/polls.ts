export interface Poll {
  id: number
  created_at: string | null
  title: string
  option_1: string
  option_2: string
  option_3: string | null
  option_4: string | null
  option_5: string | null
  cast_hash: string | null
  image_url: string | null
  channel: string | null
  status: string
  user_id: number | null
  result_image_url: string | null
  inspired_by: boolean
  expedited: boolean
  bounty_id: string
  gating_id: string | null
  id_uuid: string
  archived: boolean
  is_anonymous: boolean
}
