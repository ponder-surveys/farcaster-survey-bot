import * as dotenv from 'dotenv'
dotenv.config()

import {
  scheduleValidateNextQuestion,
  schedulePublishNextQuestion,
  schedulePublishNextDirectQuestion,
  schedulePollResults,
  schedulePollDirectResults,
} from './services/cron'
import { replyToMentions } from './services/replyToMentions'
import { getCronTimeMinus1Hour } from './utils/cronTime'
import { getDateTag } from './utils/getDateTag'

console.log(`${getDateTag()} Surveying the casters...`)

const nextGeneralQuestionTime = process.env.NEXT_GENERAL_QUESTION_CRON as string
const nextCommunityQuestionTime = process.env
  .NEXT_COMMUNITY_QUESTION_CRON as string
const nextExpeditedQuestionTime = process.env
  .NEXT_EXPEDITED_QUESTION_CRON as string
const nextDirectQuestionTime = process.env.NEXT_DIRECT_QUESTION_CRON as string

const nextPollResultsTime = process.env.NEXT_POLL_RESULTS_CRON as string
const nextPollDirectResultsTime = process.env
  .NEXT_POLL_DIRECT_RESULTS_CRON as string

const surveyFid = Number(process.env.FARCASTER_FID)
const surveySigner = process.env.NEYNAR_SIGNER_UUID as string

const pollFid = Number(process.env.POLL_FID)
const pollSigner = process.env.NEYNAR_POLL_SIGNER_UUID as string

// Warn 1 hour in advance if the next questions are estimated to be invalid
const nextGeneralQuestionValidateTime = getCronTimeMinus1Hour(
  nextGeneralQuestionTime
)
const nextCommunityQuestionValidateTime = getCronTimeMinus1Hour(
  nextCommunityQuestionTime
)
scheduleValidateNextQuestion(nextGeneralQuestionValidateTime, 'general')
scheduleValidateNextQuestion(nextCommunityQuestionValidateTime, 'community')
// Expedited questions are not validated due to high polling frequency

// Schedule next questions
schedulePublishNextQuestion(nextGeneralQuestionTime, 'general')
schedulePublishNextQuestion(nextCommunityQuestionTime, 'community')
schedulePublishNextQuestion(nextExpeditedQuestionTime, 'expedited')
schedulePublishNextDirectQuestion(nextDirectQuestionTime)

// Poll for results
schedulePollResults(nextPollResultsTime)
schedulePollDirectResults(nextPollDirectResultsTime)

// Handle '@survey' mentions
replyToMentions(surveyFid, 'survey', surveySigner)

// Handle '@poll' mentions
replyToMentions(pollFid, 'poll', pollSigner)
