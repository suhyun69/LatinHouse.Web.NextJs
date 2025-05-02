
/*
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) 
*/

// lib/supabase.ts
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createBrowserSupabaseClient()
