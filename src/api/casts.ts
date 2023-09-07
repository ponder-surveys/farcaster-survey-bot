import { farcasterClient } from '../clients/farcaster'
import { getDateTag } from '../utils/getDateTag'
import { CONTENT_FID } from '../utils/constants'

const getCastsInThread = async (hash: string) => {
  const castIterator = await farcasterClient.fetchCastsInThread({ hash })

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
  const cast = await farcasterClient.publishCast(formattedCast)
  if (formattedReply) {
    await farcasterClient.publishCast(formattedReply, cast)
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
  const replyCast = await farcasterClient.publishCast(formattedReply, {
    hash: castHash,
    fid,
  })

  if (formattedChainedReply) {
    await farcasterClient.publishCast(formattedChainedReply, replyCast)
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
