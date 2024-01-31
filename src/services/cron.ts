import * as cron from 'node-cron'
import { validateQuestion } from '../utils/validateQuestion'
import { publishNextQuestion } from './publishNextQuestion'
import { publishNextDirectQuestion } from './publishNextDirectQuestion'
import { publishNextResults } from './publishNextResults'

const scheduleValidateNextQuestion = (cronTime: string, type: QuestionType) =>
  cron.schedule(cronTime, () => validateQuestion(type), {
    timezone: 'UTC',
  })

const schedulePublishNextQuestion = (cronTime: string, type: QuestionType) =>
  cron.schedule(cronTime, () => publishNextQuestion(type), {
    timezone: 'UTC',
  })

const schedulePublishNextDirectQuestion = (cronTime: string) =>
  cron.schedule(cronTime, () => publishNextDirectQuestion(), {
    timezone: 'UTC',
  })

const schedulePollResults = (cronTime: string) =>
  cron.schedule(cronTime, () => publishNextResults(), {
    timezone: 'UTC',
  })

export {
  scheduleValidateNextQuestion,
  schedulePublishNextQuestion,
  schedulePublishNextDirectQuestion,
  schedulePollResults,
}
