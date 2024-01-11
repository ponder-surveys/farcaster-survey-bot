import { neynarClient } from '../clients/neynar'
import { getDateTag } from '../utils/getDateTag'

const getCastsInThread = async (hash: string) => {
  try {
    const data = await neynarClient.fetchAllCastsInThread(hash)
    const casts = data.result.casts
    return casts
  } catch (e) {
    throw new Error(`${getDateTag()} Error retrieving cast replies`)
  }
}

const publishCast = async (
  type: string,
  formattedCast: string,
  formattedReply?: string
) => {
  const signerUuid = process.env.NEYNAR_SIGNER_UUID as string
  const cast = await neynarClient.publishCast(signerUuid, formattedCast)
  if (formattedReply) {
    await neynarClient.publishCast(signerUuid, formattedReply, {
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
  const replyCast = await neynarClient.publishCast(signerUuid, formattedReply, {
    replyTo: castHash,
  })

  if (formattedChainedReply) {
    await neynarClient.publishCast(signerUuid, formattedChainedReply, {
      replyTo: replyCast.hash,
    })
  }

  console.log(
    `${getDateTag()} Next ${type} published successfully: ${replyCast.hash}`
  )

  return replyCast
}

export { getCastsInThread, publishCast, publishReply }
