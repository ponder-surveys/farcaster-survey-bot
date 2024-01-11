import { ethers } from 'ethers'
import { neynarClient } from '../clients/neynar'
import { supabaseClient } from '../clients/supabase'
import { alchemyClient } from '../clients/alchemy'
import { getDateTag } from '../utils/getDateTag'

const getUsername = async (userId?: number): Promise<string | null> => {
  if (!userId) return null

  const { data, error } = await supabaseClient
    .from('users')
    .select('username')
    .eq('id', userId)
    .single()

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  return data?.username || null
}

const getUserId = async (user: NeynarUser): Promise<number> => {
  // Check if user exists
  const { data, error } = await supabaseClient
    .from('users')
    .select('id')
    .eq('fid', user.fid)
    .limit(1)

  if (error) {
    console.error(`Error fetching user with fid ${user.fid}:`, error)
    throw error
  }

  // If user exists, return the user_id
  if (data?.length > 0) {
    return data[0].id
  }

  if (process.env.NODE_ENV !== 'production') {
    return 0
  }

  // If user doesn't exist, insert a new user and return the new user_id
  const address = process.env.NFT_COLLECTION_ADDRESS as string
  let walletWithNft: string | null = null
  let verifications: string[] | undefined = []

  try {
    const { result: verificationResponse } =
      await neynarClient.fetchUserVerifications(user.fid)

    if (verificationResponse && verificationResponse.verifications) {
      verifications = verificationResponse.verifications
      for await (const verification of verificationResponse.verifications) {
        const { tokenBalances } = await alchemyClient.core.getTokenBalances(
          verification,
          [address]
        )

        if (tokenBalances[0].tokenBalance) {
          const balance = ethers.BigNumber.from(
            tokenBalances[0].tokenBalance
          ).toNumber()

          if (balance > 0) {
            walletWithNft = verification
            break
          }
        }
      }
    }
  } catch (verificationError) {
    console.error('Error fetching verifications:', verificationError)
    throw verificationError
  }

  const userId = await addUser(user, walletWithNft, verifications)
  return userId
}

const addUser = async (
  user: NeynarUser,
  ethAddress: string | null,
  verifications: string[] | undefined
): Promise<number> => {
  const { data, error } = await supabaseClient
    .from('users')
    .insert([
      {
        fid: user.fid,
        username: user.username,
        display_name: user.displayName,
        profile_picture: user.pfp?.url,
        holder_address: ethAddress,
        connected_addresses: verifications,
      },
    ])
    .select('*')

  if (error) {
    console.error(`Error inserting user with fid ${user.fid}:`, error)
    throw error
  }

  if (!data) {
    throw new Error(`No data returned when inserting user with fid ${user.fid}`)
  }

  const insertedUsers = data as User[]

  if (insertedUsers.length > 0) {
    return insertedUsers[0].id
  } else {
    throw new Error(`Failed to insert user with fid ${user.fid}`)
  }
}

export { getUsername, getUserId, addUser }
