export const MAX_BYTE_SIZE = 320
export const SURVEY_FRAME_URL = 'https://frame.weponder.io/api/polls'
export const QUESTION_FRAME_URL = 'https://frame.weponder.io/api/questions'
export const COMPOSER_ACTION_PREDICTIVE_POLL_URL = `https://warpcast.com/~/composer-action?url=${encodeURIComponent(
  `https://frame.weponder.io/api/actions/create-predict`
)}`
export const CREATE_SURVEY_FRAME_URL =
  'https://weponder.io/api/surveys/frames/new'

export const EDGE_FUNCTIONS_SERVER_URL =
  process.env.EDGE_FUNCTIONS_SERVER_URL || 'https://edgefunctions.weponder.io'

export const EDGE_FUNCTIONS_SECRET_TOKEN =
  process.env.EDGE_FUNCTIONS_SECRET_TOKEN

export const FRAME_API_URL =
  process.env.FRAME_API_URL || 'contracts.weponder.io'

export const APP_URL = process.env.APP_URL || 'https://www.weponder.io'

export const WARPCAST_API_KEY = process.env.WARPCAST_API_KEY || ''

// Sentry
export const SENTRY_DSN = process.env.SENTRY_DSN
export const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT

// ThirdWeb
export const POLL_INTERVAL = 1000 // Poll every 1 second
export const POLL_TIMEOUT = 60000 // Stop after 60 seconds
export const WEB3_ENGINE_URL = process.env.WEB3_ENGINE_URL
export const WEB3_ACCESS_TOKEN = process.env.WEB3_ACCESS_TOKEN

export const TRANSACTION_ADDRESS = process.env.TRANSACTION_ADDRESS

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

export const CHAINS = new Map<
  string,
  {
    CHAIN_ID: number
    PROVIDER_URL: string
    QUESTION_CONTRACT_ADDRESS: string
    POLL_CONTRACT_ADDRESS: string
    PREDICTIVE_POLL_CONTRACT_ADDRESS: string
  }
>([
  [
    'base',
    {
      CHAIN_ID: 8453,
      PROVIDER_URL: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      QUESTION_CONTRACT_ADDRESS:
        process.env.BASE_QUESTION_CONTRACT_ADDRESS || '',
      POLL_CONTRACT_ADDRESS: process.env.BASE_POLL_CONTRACT_ADDRESS || '',
      PREDICTIVE_POLL_CONTRACT_ADDRESS:
        process.env.BASE_PREDICTIVE_POLL_CONTRACT_ADDRESS || '',
    },
  ],
  [
    'base-sepolia',
    {
      CHAIN_ID: 84532,
      PROVIDER_URL: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      QUESTION_CONTRACT_ADDRESS:
        process.env.BASE_SEPOLIA_QUESTION_CONTRACT_ADDRESS || '',
      POLL_CONTRACT_ADDRESS:
        process.env.BASE_SEPOLIA_POLL_CONTRACT_ADDRESS || '',
      PREDICTIVE_POLL_CONTRACT_ADDRESS:
        process.env.BASE_SEPOLIA_PREDICTIVE_POLL_CONTRACT_ADDRESS || '',
    },
  ],
  [
    'optimism',
    {
      CHAIN_ID: 10,
      PROVIDER_URL: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      QUESTION_CONTRACT_ADDRESS: process.env.OP_QUESTION_CONTRACT_ADDRESS || '',
      POLL_CONTRACT_ADDRESS: process.env.OP_POLL_CONTRACT_ADDRESS || '',
      PREDICTIVE_POLL_CONTRACT_ADDRESS:
        process.env.OP_PREDICTIVE_POLL_CONTRACT_ADDRESS || '',
    },
  ],
  [
    'optimism-sepolia',
    {
      CHAIN_ID: 11155420,
      PROVIDER_URL: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      QUESTION_CONTRACT_ADDRESS:
        process.env.OP_SEPOLIA_QUESTION_CONTRACT_ADDRESS || '',
      POLL_CONTRACT_ADDRESS: process.env.OP_SEPOLIA_POLL_CONTRACT_ADDRESS || '',
      PREDICTIVE_POLL_CONTRACT_ADDRESS:
        process.env.OP_SEPOLIA_PREDICTIVE_POLL_CONTRACT_ADDRESS || '',
    },
  ],
])
