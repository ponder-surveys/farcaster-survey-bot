import * as cron from 'node-cron'
import { validateQuestion } from '../utils/validateQuestion'
import { publishNextQuestion } from './publishNextQuestion'
import { publishNextResults } from './publishNextResults'
import { publishNextQuestionsQualUpdate } from './publishNextQuestionsQualUpdate'

const scheduleValidateNextQuestion = (cronTime: string, type: QuestionType) =>
  cron.schedule(cronTime, () => validateQuestion(type), {
    timezone: 'UTC',
  })

const schedulePublishNextQuestion = (cronTime: string, type: QuestionType) =>
  cron.schedule(cronTime, () => publishNextQuestion(type), {
    timezone: 'UTC',
  })

const schedulePollResults = (cronTime: string) =>
  cron.schedule(cronTime, () => publishNextResults(), {
    timezone: 'UTC',
  })

const scheduleQuestionQualUpdate = (cronTime: string) =>
  cron.schedule(cronTime, () => publishNextQuestionsQualUpdate(), {
    timezone: 'UTC',
  })

export {
  scheduleValidateNextQuestion,
  schedulePublishNextQuestion,
  schedulePollResults,
  scheduleQuestionQualUpdate,
}
