import { createClient } from "@supabase/supabase-js";


export const supabase = createClient(
    process.env.NEXT_AUTH_SUPABASE_URL as string,
    process.env.NEXT_AUTH_SUPABASE_API_KEY as string,
)