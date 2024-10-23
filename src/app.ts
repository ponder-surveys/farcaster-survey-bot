import {
  schedulePollResults,
  schedulePredictivePollResults,
  scheduleQuestionQualUpdate,
} from './services/cron'
import { getDateTag } from './utils/getDateTag'

console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`${getDateTag()} Surveying the casters...`)

const nextPollResultsTime = Bun.env.NEXT_POLL_RESULTS_CRON as string
const nextPredictivePollResultsTime = Bun.env
  .NEXT_PREDICTIVE_POLL_RESULTS_CRON as string
const nextQuestionUQualTime = Bun.env.NEXT_QUESTION_QUAL_UPDATE_CRON as string

// Poll for results
schedulePollResults(nextPollResultsTime)

// Update question qual
scheduleQuestionQualUpdate(nextQuestionUQualTime)

// Update expired predictive polls
schedulePredictivePollResults(nextPredictivePollResultsTime)
