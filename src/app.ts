import * as dotenv from 'dotenv'
dotenv.config()

import {
  scheduleValidateNextQuestion,
  schedulePublishNextQuestion,
  schedulePublishNextResult,
} from './services/cron'
import { replyToMentions } from './services/replyToMentions'
import { getCronTimeMinus24Hours } from './utils/cronTime'
import { getDateTag } from './utils/getDateTag'

console.log(`${getDateTag()} Surveying the casters...`)

const nextGeneralQuestionTime = process.env.NEXT_GENERAL_QUESTION_CRON as string
const nextChannelQuestionsTime = process.env
  .NEXT_CHANNEL_QUESTIONS_CRON as string

const nextGeneralResultTime = process.env.NEXT_GENERAL_RESULT_CRON as string
const nextChannelResultsTime = process.env.NEXT_CHANNEL_RESULTS_CRON as string

// Warn 24 hours in advance if the next questions are estimated to be invalid
const nextGeneralQuestionValidateTime = getCronTimeMinus24Hours(
  nextGeneralQuestionTime
)
const nextChannelQuestionsValidateTime = getCronTimeMinus24Hours(
  nextChannelQuestionsTime
)
scheduleValidateNextQuestion(nextGeneralQuestionValidateTime, 'general')
scheduleValidateNextQuestion(nextChannelQuestionsValidateTime, 'channel')

// Schedule next questions
schedulePublishNextQuestion(nextGeneralQuestionTime, 'general')
schedulePublishNextQuestion(nextChannelQuestionsTime, 'channel')

// Schedule next results
schedulePublishNextResult(nextGeneralResultTime, 'general')
schedulePublishNextResult(nextChannelResultsTime, 'channel')

// Poll for '@' mentions
replyToMentions()
