import * as cron from 'node-cron'
import { validateQuestion } from '../utils/validateQuestion'
import { publishNextQuestion } from '../services/publishNextQuestion'
import { publishNextResult } from '../services/publishNextResult'

const scheduleValidateNextQuestion = (cronTime: string) =>
  cron.schedule(cronTime, validateQuestion, {
    timezone: 'UTC',
  })

const schedulePublishNextQuestion = (cronTime: string) =>
  cron.schedule(cronTime, publishNextQuestion, {
    timezone: 'UTC',
  })

const schedulePublishNextResult = (cronTime: string) =>
  cron.schedule(cronTime, publishNextResult, {
    timezone: 'UTC',
  })

export {
  scheduleValidateNextQuestion,
  schedulePublishNextQuestion,
  schedulePublishNextResult,
}
