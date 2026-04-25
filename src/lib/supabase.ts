import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://emeuelwnghssbywebvqn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8Yyn2tyZtIeQAk9x9Kzntg_X2RgwG8b';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
