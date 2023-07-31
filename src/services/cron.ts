import * as cron from 'node-cron'
import { validateQuestions } from '../utils/validateQuestions'
import { publishNextQuestions } from './publishNextQuestions'
import { publishNextResult } from './publishNextResult'

const scheduleValidateNextQuestion = (cronTime: string) =>
  cron.schedule(cronTime, validateQuestions, {
    timezone: 'UTC',
  })

const schedulePublishNextQuestion = (cronTime: string) =>
  cron.schedule(cronTime, publishNextQuestions, {
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
