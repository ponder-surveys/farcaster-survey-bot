import { buildFarcasterClient } from '../clients/farcaster'
import { getDateTag } from '../utils/getDateTag'
import { CONTENT_FID } from '../utils/constants'

const getCastsInThread = async (hash: string) => {
  const farcaster = buildFarcasterClient()
  const castIterator = await farcaster.fetchCastsInThread({ hash })

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
  const farcaster = buildFarcasterClient()

  const cast = await farcaster.publishCast(formattedCast)
  if (formattedReply) {
    await farcaster.publishCast(formattedReply, cast)
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
  const farcaster = buildFarcasterClient()

  const replyCast = await farcaster.publishCast(formattedReply, {
    hash: castHash,
    fid,
  })

  if (formattedChainedReply) {
    await farcaster.publishCast(formattedChainedReply, replyCast)
  }

  if (fid === CONTENT_FID) {
    console.log(
      `${getDateTag()} Next question published successfully: ${
        replyCast.hash
      }`
    )
  } else {
    console.log(
      `${getDateTag()} Reply published successfully: ${replyCast.hash}`
    )
  }

  return replyCast
}

export { getCastsInThread, publishCast, publishReply }
