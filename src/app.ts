import * as dotenv from 'dotenv'
dotenv.config()

import {
  scheduleValidateNextQuestion,
  schedulePublishNextQuestion,
  schedulePublishNextResult,
} from './services/cron'
import { getCronTimeMinus24Hours } from './utils/cronTime'

console.log('Surveying the casters...')

const nextQuestionTime = process.env.NEXT_QUESTION_CRON as string
const nextResultTime = process.env.NEXT_RESULT_CRON as string

// Warn 24 hours in advance if the next question is estimated to be invalid
const nextValidateTime = getCronTimeMinus24Hours(nextQuestionTime)
scheduleValidateNextQuestion(nextValidateTime)

// Schedule the next question and result
schedulePublishNextQuestion(nextQuestionTime)
schedulePublishNextResult(nextResultTime)
