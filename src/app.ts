import * as dotenv from 'dotenv'
dotenv.config()

import {
  schedulePollResults,
  scheduleQuestionQualUpdate,
} from './services/cron'
import { getDateTag } from './utils/getDateTag'

console.log(`${getDateTag()} Surveying the casters...`)

const nextPollResultsTime = process.env.NEXT_POLL_RESULTS_CRON as string
const nextQuestionUQualTime = process.env
  .NEXT_QUESTION_QUAL_UPDATE_CRON as string

// Poll for results
schedulePollResults(nextPollResultsTime)

// Update question qual
scheduleQuestionQualUpdate(nextQuestionUQualTime)
