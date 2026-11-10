import { createClient } from '@supabase/supabase-js';

// import.meta.env is provided by Vite; fall back to process.env for Node scripts
const env = typeof import.meta.env !== 'undefined' ? import.meta.env : process.env;

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);