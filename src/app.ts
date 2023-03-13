import * as dotenv from 'dotenv'
dotenv.config()

import { formatCronTime } from './utils/formatCronTime'
import {
  schedulePublishNextQuestion,
  schedulePublishNextResult,
} from './services/cron'

console.log('Surveying the casters...')

const CRON_NEXT_QUESTION = '0 11 * * 1,3' // 11am EST on Mondays and Wednesdays
const CRON_NEXT_RESULT = '0 10 * * 3,5' // 10am EST on Wednesdays and Fridays

console.log(formatCronTime(CRON_NEXT_QUESTION, 'question'))
console.log(formatCronTime(CRON_NEXT_RESULT, 'result'))

schedulePublishNextQuestion(CRON_NEXT_QUESTION)
schedulePublishNextResult(CRON_NEXT_RESULT)
