import { buildSupabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const addBookmark = async (bookmark: Bookmark) => {
  const supabase = buildSupabaseClient()

  const { error } = await supabase.from('bookmarks').upsert(bookmark)

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  console.log(`${getDateTag()} Bookmark successfully uploaded on db`)
}

export { addBookmark }
