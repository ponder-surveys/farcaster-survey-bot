import { getNextResults, updateNextResult } from '../api/results'
import { getResponses, addResponses } from '../api/responses'
import { getUserId, getUsername } from '../api/users'
import { getCastsInThread, publishCast, publishReply } from '../api/casts'
import { farcasterClient } from '../clients/farcaster'
import { validateResponse } from '../utils/validateResponse'
import { createChart } from '../utils/createChart'
import {
  formatResult,
  formatReply,
  formatReplyToSurvey,
} from '../utils/formatResult'
import { calculateByteSize } from '../utils/byteSize'
import { CONTENT_FID, MAX_BYTE_SIZE, MOCK_IMGUR_URL } from '../utils/constants'
import { getDateTag } from '../utils/getDateTag'
import { getChannelHash } from '../utils/getChannelHash'

const publishNextResults = async (type: 'general' | 'channel') => {
  const results = await getNextResults(type)

  for (const result of results) {
    const username = await getUsername(result.user_id)
    const resultHash = result.cast_hash as string
    const castIterator = await getCastsInThread(resultHash)

    const responses: QuestionResponse[] = []
    const optionCounts: OptionCounts = {}

    // Initialize option counts
    for (let i = 1; i <= 5; i++) {
      if (result[`option_${i}` as keyof Question]) {
        optionCounts[i] = 0
      }
    }

    // Populate responses and option counts
    for await (const cast of castIterator) {
      const match = validateResponse(cast.text)

      const castAuthor = cast.author as any // Temporary fix for farcaster-js-neynar CastAuthorOneOf only having fid

      if (match) {
        const selected_option = Number(match[1])
        const comment = match[2] !== undefined ? match[2].trim() : ''
        const userId = await getUserId(
          cast.author.fid as number,
          castAuthor as string
        )

        if (!responses.some((response) => response.user_id === userId)) {
          responses.push({
            question_id: result.id,
            selected_option,
            comment,
            user_id: userId,
            cast_hash: cast.hash,
          })
          optionCounts[selected_option]++
        }
      }
    }

    // Add extra responses manually from db
    const extraResponses = await getResponses(result.id)
    for (const extraResponse of extraResponses) {
      const optionIndex = extraResponse.selected_option
      if (optionCounts[optionIndex]) {
        optionCounts[optionIndex]++
      } else {
        optionCounts[optionIndex] = 1
      }
    }

    const totalResponses = responses.length + extraResponses.length

    const formattedResult = formatResult(
      result,
      username,
      optionCounts,
      totalResponses
    )
    const resultHashShorthand = resultHash.substring(0, 6)
    const formattedReply = formatReply(resultHashShorthand)
    const chartUrl =
      process.env.NODE_ENV === 'production'
        ? await createChart(result.id, optionCounts, totalResponses)
        : MOCK_IMGUR_URL

    const response = `${formattedResult}\n${chartUrl}`

    const resultByteSize = calculateByteSize(response)
    if (resultByteSize >= MAX_BYTE_SIZE) {
      console.error(
        `${getDateTag()} Error: Result is too large to publish.\nSize: ${resultByteSize} bytes. Max size: ${MAX_BYTE_SIZE} bytes.\n`
      )
      continue
    }

    if (process.env.NODE_ENV === 'production') {
      let hash = ''

      if (type === 'channel' && result.channel) {
        const channelHash = getChannelHash(result.channel.toLowerCase())
        const cast = await publishReply(
          response,
          channelHash,
          CONTENT_FID,
          formattedReply
        )
        hash = cast.hash
      } else {
        const cast = await publishCast('result', response, formattedReply)
        hash = cast.hash
      }

      const replyHashShorthand = hash.substring(0, 6)
      const replyToSurvey = formatReplyToSurvey(replyHashShorthand)
      const fid = Number(process.env.FARCASTER_FID)
      await publishReply(replyToSurvey, result.cast_hash as string, fid)

      await addResponses(responses)
      await updateNextResult(result.id)
    } else {
      console.log(
        `${getDateTag()} Mock result cast${
          result.channel ? ` in ${result.channel} channel` : ''
        }:\n\n${response}`
      )
      console.log(`${getDateTag()} Mock reply:\n\n${formattedReply}`)
    }
  }
}

export { publishNextResults }
