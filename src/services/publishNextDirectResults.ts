import {
  getNextDirectResults,
  updateNextDirectResult,
} from '../api/direct-results'
import { addDirectResponse } from '../api/direct-responses'
import { addDirectResultReactions } from '../api/direct-reactions'
import { getUserId, getUsername } from '../api/users'
import { getCastsInThread, publishReply } from '../api/casts'
import { web3Engine } from '../clients/web3Engine'
import { getDateTag } from '../utils/getDateTag'
import {
  formatDirectResult,
  formatDirectQuestionFailed,
} from '../utils/formatDirectResult'
import { Base } from '@thirdweb-dev/chains'

const publishNextDirectResults = async () => {
  const directResults = await getNextDirectResults()

  for await (const directResult of directResults) {
    const {
      id: directResultId,
      cast_hash: directResultHash,
      author_id: directResultAuthorId,
      recipient_id: directResultRecipientId,
      smart_contract_id: directResultSmartContractId,
      anonymous,
    } = directResult
    const castIterator = await getCastsInThread(directResultHash as string)
    let directQuestionAnswered = false
    const authorUsername = anonymous
      ? null
      : await getUsername(directResultAuthorId)

    for await (const cast of castIterator) {
      const castAuthor = cast.author as unknown as NeynarUser // Temporary fix for farcaster-js-neynar CastAuthorOneOf only having fid
      const userId = await getUserId(castAuthor)

      if (directResultRecipientId === userId) {
        directQuestionAnswered = true
        const formattedDirectResult = formatDirectResult(authorUsername)

        if (process.env.NODE_ENV === 'production') {
          await publishReply(
            'direct question success reply',
            cast.hash,
            formattedDirectResult
          )
          await updateNextDirectResult(directResultId, 'ANSWERED')
          const directResponse = await addDirectResponse({
            direct_question_id: directResultId,
            recipient_id: userId,
            answer: cast.text,
            cast_hash: cast.hash,
          })
          await addDirectResultReactions(directResult, directResponse)
        } else {
          console.log(
            `${getDateTag()} Mock direct question success reply for recipient ${directResultRecipientId}:\n\n${formattedDirectResult}`
          )
        }
        continue
      }
    }

    if (!directQuestionAnswered) {
      const formattedDirectQuestionFailed =
        formatDirectQuestionFailed(authorUsername)
      if (process.env.NODE_ENV === 'production') {
        const chain = Base.chainId.toString()
        const directSurveyAddress = process.env
          .DIRECT_SURVEY_CONTRACT_ADDRESS as string
        const transactionAddress = process.env.TRANSACTION_ADDRESS as string
        const directSurveyId = directResultSmartContractId?.toString() as string

        await web3Engine.contract.write(
          chain,
          directSurveyAddress,
          transactionAddress,
          {
            functionName: 'failSurvey',
            args: [directSurveyId],
          }
        )

        await updateNextDirectResult(directResultId, 'FAILED')

        await publishReply(
          'direct question failure reply',
          directResultHash as string,
          formattedDirectQuestionFailed
        )
      } else {
        console.log(
          `${getDateTag()} Mock direct question failed reply for recipient ${directResultRecipientId}:\n\n${formattedDirectQuestionFailed}`
        )
      }
    }
  }
}

export { publishNextDirectResults }
