// lib/supabase-js-client.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseJs = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
