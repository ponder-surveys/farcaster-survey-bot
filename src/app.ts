import * as dotenv from 'dotenv'
dotenv.config()

import { formatCronTime } from './utils/formatCronTime'
import {
  schedulePublishNextQuestion,
  schedulePublishNextResult,
} from './services/cron'

console.log('Surveying the casters...')

const nextQuestion = process.env.NEXT_QUESTION_CRON as string
const nextResult = process.env.NEXT_RESULT_CRON as string

console.log(formatCronTime(nextQuestion, 'question'))
console.log(formatCronTime(nextResult, 'result'))

schedulePublishNextQuestion(nextQuestion)
schedulePublishNextResult(nextResult)
