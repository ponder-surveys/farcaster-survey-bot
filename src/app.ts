import logger from 'utils/logger'
import {
  schedulePollResults,
  schedulePredictivePollResults,
  schedulePublishDailyPrediction,
  scheduleQuestionQualUpdate,
} from './services/cron'

logger.info(`NODE_ENV: ${Bun.env.NODE_ENV}`)
logger.info('=== Surveying the casters ===')

const nextPollResultsTime = Bun.env.NEXT_POLL_RESULTS_CRON as string
const nextPredictivePollResultsTime = Bun.env
  .NEXT_PREDICTIVE_POLL_RESULTS_CRON as string
const nextQuestionUQualTime = Bun.env.NEXT_QUESTION_QUAL_UPDATE_CRON as string

const nextDailyPredictionTime = Bun.env.NEXT_DAILY_PREDICTION_CRON as string

// Poll for results
schedulePollResults(nextPollResultsTime)

// Update question qual
scheduleQuestionQualUpdate(nextQuestionUQualTime)

// Update expired predictive polls
schedulePredictivePollResults(nextPredictivePollResultsTime)

// Daily prediction
schedulePublishDailyPrediction(nextDailyPredictionTime)
