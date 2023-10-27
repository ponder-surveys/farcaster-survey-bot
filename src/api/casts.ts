import { farcasterClient, signerUuid } from '../clients/farcaster'
import { getDateTag } from '../utils/getDateTag'
import { CONTENT_FID } from '../utils/constants'

const getCastsInThread = async (hash: string) => {
  const castIterator = await farcasterClient.v1.fetchCastsInThread(hash)

  if (!castIterator) {
    throw new Error(`${getDateTag()} Error retrieving cast replies`)
  }

  return castIterator
}

const publishCast = async (
  type: string,
  formattedCast: string,
  formattedReply?: string
) => {
  const cast = await farcasterClient.v2.publishCast(signerUuid, formattedCast)
  if (formattedReply) {
    await farcasterClient.v2.publishCast(signerUuid, formattedReply, {
      replyTo: cast.hash,
    })
  }
  console.log(
    `${getDateTag()} Next ${type} published successfully: ${cast.hash}`
  )

  return cast
}

const publishReply = async (
  formattedReply: string,
  castHash: string,
  fid: number,
  formattedChainedReply?: string
) => {
  const replyCast = await farcasterClient.v2.publishCast(
    signerUuid,
    formattedReply,
    { replyTo: castHash }
  )

  if (formattedChainedReply) {
    await farcasterClient.v2.publishCast(signerUuid, formattedChainedReply, {
      replyTo: replyCast.hash,
    })
  }

  if (fid === CONTENT_FID) {
    console.log(
      `${getDateTag()} Next question published successfully: ${replyCast.hash}`
    )
  } else {
    console.log(
      `${getDateTag()} Reply published successfully: ${replyCast.hash}`
    )
  }

  return replyCast
}

export { getCastsInThread, publishCast, publishReply }
