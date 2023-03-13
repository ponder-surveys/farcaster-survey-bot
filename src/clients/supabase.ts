import { createClient } from '@supabase/supabase-js'

const buildSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseKey = process.env.SUPABASE_KEY as string
  const client = createClient(supabaseUrl, supabaseKey)

  return client
}

export { buildSupabaseClient }
