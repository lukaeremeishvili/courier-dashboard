// import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// No need to log this every time the client is created
// console.log('Checking Supabase Configuration:')
// console.log('URL:', supabaseUrl)
// console.log('Key starts with:', supabaseAnonKey.substring(0, 20) + '...')

// Create a client component Supabase client
// Note: This client is intended for use in client components ('use client')
// For server components, use createServerComponentClient or related helpers.
export const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
}) 