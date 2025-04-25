import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_SUPABASE_URL as string,
  process.env.NEXT_SUPABASE_API_KEY as string
);
