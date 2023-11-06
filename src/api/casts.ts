import { farcasterClient } from '../clients/farcaster'
import { getDateTag } from '../utils/getDateTag'

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
  const signerUuid = process.env.NEYNAR_SIGNER_UUID as string
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
  type: string,
  castHash: string,
  formattedReply: string,
  formattedChainedReply?: string
) => {
  const signerUuid = process.env.NEYNAR_SIGNER_UUID as string
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

  console.log(
    `${getDateTag()} Next ${type} published successfully: ${replyCast.hash}`
  )

  return replyCast
}

export { getCastsInThread, publishCast, publishReply }
