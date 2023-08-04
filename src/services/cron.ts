import * as cron from 'node-cron'
import { validateQuestions } from '../utils/validateQuestions'
import { publishNextQuestions } from './publishNextQuestions'
import { publishNextResults } from './publishNextResults'

const scheduleValidateNextQuestion = (
  cronTime: string,
  type: 'general' | 'channel'
) =>
  cron.schedule(cronTime, () => validateQuestions(type), {
    timezone: 'UTC',
  })

const schedulePublishNextQuestion = (
  cronTime: string,
  type: 'general' | 'channel'
) =>
  cron.schedule(cronTime, () => publishNextQuestions(type), {
    timezone: 'UTC',
  })

const schedulePublishNextResult = (
  cronTime: string,
  type: 'general' | 'channel'
) =>
  cron.schedule(cronTime, () => publishNextResults(type), {
    timezone: 'UTC',
  })

export {
  scheduleValidateNextQuestion,
  schedulePublishNextQuestion,
  schedulePublishNextResult,
}
