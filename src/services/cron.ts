import * as cron from 'node-cron'
import { publishNextQuestion } from '../services/publishNextQuestion'
import { publishNextResult } from '../services/publishNextResult'

const schedulePublishNextQuestion = (cronTime: string) =>
  cron.schedule(cronTime, publishNextQuestion, {
    timezone: 'America/New_York',
  })

const schedulePublishNextResult = (cronTime: string) =>
  cron.schedule(cronTime, publishNextResult, {
    timezone: 'America/New_York',
  })

export { schedulePublishNextQuestion, schedulePublishNextResult }
