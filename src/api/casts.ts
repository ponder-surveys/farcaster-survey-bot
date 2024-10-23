import {
  CastParamType,
  EmbeddedCast,
} from '@neynar/nodejs-sdk/build/neynar-api/v2'
import { neynarClient, neynarSigner } from '../clients/neynar'
import { getDateTag } from '../utils/getDateTag'
import logger from '../utils/logger'

interface EmbedOptions {
  embeds?: EmbeddedCast[]
  replyTo?: string
  channelId?: string
}

const getCastsInThread = async (hash: string) => {
  try {
    const data = await neynarClient.lookupCastConversation(
      hash,
      CastParamType.Hash,
      { replyDepth: 1 }
    )
    const casts = data?.conversation?.cast?.direct_replies || []
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
  logger.info(`Next ${type} published successfully: ${cast.hash}`)

  return cast
}

const publishReply = async (
  type: string,
  castHash: string,
  formattedReply: string,
  imageUrl?: string,
  formattedChainedReply?: string,
  signer?: string
) => {
  if (!signer) {
    signer = neynarSigner
  }
  const options = { replyTo: castHash } as EmbedOptions

  if (imageUrl) {
    options.embeds = [{ url: imageUrl }]
  }

  const replyCast = await neynarClient.publishCast(
    signer,
    formattedReply,
    options
  )

  if (formattedChainedReply) {
    await neynarClient.publishCast(signer, formattedChainedReply, {
      replyTo: replyCast.hash,
    })
  }

  logger.info(`Next ${type} published successfully: ${replyCast.hash}`)

  return replyCast
}

export { getCastsInThread, publishCast, publishReply }
