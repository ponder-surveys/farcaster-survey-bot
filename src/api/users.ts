import { farcasterClient } from '../clients/farcaster'
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

const getUserId = async (fid: number, username: string): Promise<number> => {
  // Check if user exists
  const { data, error } = await supabaseClient
    .from('users')
    .select('id')
    .eq('fid', fid)
    .limit(1)

  if (error) {
    console.error(`Error fetching user with fid ${fid}:`, error)
    throw error
  }

  // If user exists, return the user_id
  if (data?.length > 0) {
    return data[0].id
  }

  // If user doesn't exist, insert a new user and return the new user_id
  const address = process.env.NFT_COLLECTION_ADDRESS as string
  const { owners } = await alchemyClient.nft.getOwnersForContract(address)
  let walletWithNft: string | null = null

  // Use fetchUserVerifications function here
  for await (const verification of farcasterClient.fetchUserVerifications({
    fid,
  })) {
    if (owners.includes(verification.address)) {
      walletWithNft = verification.address
      break
    }
  }

  const userId = await addUser(fid, username, walletWithNft)
  return userId
}

const addUser = async (
  fid: number,
  username: string,
  ethAddress: string | null
): Promise<number> => {
  const { data, error } = await supabaseClient
    .from('users')
    .insert([{ fid, username, eth_address: ethAddress }])
    .select('*')

  if (error) {
    console.error(`Error inserting user with fid ${fid}:`, error)
    throw error
  }

  if (!data) {
    throw new Error(`No data returned when inserting user with fid ${fid}`)
  }

  const insertedUsers = data as User[]

  if (insertedUsers.length > 0) {
    return insertedUsers[0].id
  } else {
    throw new Error(`Failed to insert user with fid ${fid}`)
  }
}

export { getUsername, getUserId, addUser }