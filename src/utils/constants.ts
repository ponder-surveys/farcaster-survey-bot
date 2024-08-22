export const MAX_BYTE_SIZE = 320
export const SURVEY_FRAME_URL = 'https://frame.weponder.io/api/polls'
export const QUESTION_FRAME_URL = 'https://frame.weponder.io/api/questions'
export const CREATE_SURVEY_FRAME_URL =
  'https://weponder.io/api/surveys/frames/new'

export const EDGE_FUNCTIONS_SERVER_URL =
  process.env.EDGE_FUNCTIONS_SERVER_URL || 'https://edgefunctions.weponder.io'

export const EDGE_FUNCTIONS_SECRET_TOKEN =
  process.env.EDGE_FUNCTIONS_SECRET_TOKEN

export const APP_URL = process.env.APP_URL || 'https://www.weponder.io'
