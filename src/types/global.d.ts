interface Question {
  id: number
  title: string
  option_1: string
  option_2: string
  option_3?: string
  option_4?: string
  option_5?: string
  author?: string
  image_url?: string
  cast_hash?: string
}

interface Res {
  id?: number
  question_id: number
  selected_option: number
  comment?: string
  fid: number
}

interface OptionCounts {
  [key: number]: number
}
