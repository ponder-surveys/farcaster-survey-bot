import { EmbeddedCast } from '@neynar/nodejs-sdk/build/neynar-api/v2'
import { neynarClient, neynarSigner } from '../clients/neynar'
import { getDateTag } from '../utils/getDateTag'

interface EmbedOptions {
  embeds?: EmbeddedCast[]
  replyTo?: string
  channelId?: string
}

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
  imageUrl?: string,
  formattedReply?: string
) => {
  const options = {} as EmbedOptions

  if (imageUrl) {
    options.embeds = [{ url: imageUrl }]
  }

  const cast = await neynarClient.publishCast(
    neynarSigner,
    formattedCast,
    Object.keys(options).length > 0 ? options : undefined
  )
  if (formattedReply) {
    await neynarClient.publishCast(neynarSigner, formattedReply, {
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
  imageUrl?: string,
  formattedChainedReply?: string
) => {
  const options = { replyTo: castHash } as EmbedOptions

  if (imageUrl) {
    options.embeds = [{ url: imageUrl }]
  }

  const replyCast = await neynarClient.publishCast(
    neynarSigner,
    formattedReply,
    options
  )

  if (formattedChainedReply) {
    await neynarClient.publishCast(neynarSigner, formattedChainedReply, {
      replyTo: replyCast.hash,
    })
  }

  console.log(
    `${getDateTag()} Next ${type} published successfully: ${replyCast.hash}`
  )

  return replyCast
}

export { getCastsInThread, publishCast, publishReply }
