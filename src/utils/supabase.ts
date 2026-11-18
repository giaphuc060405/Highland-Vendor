import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta.env !== 'undefined' ? import.meta.env : process.env;

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);