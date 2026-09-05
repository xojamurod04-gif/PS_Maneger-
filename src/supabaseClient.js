import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wbidztfspkhtpyhdqmvd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiaWR6dGZzcGtodHB5aGRxbXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjUxNjQsImV4cCI6MjEwNDIwMTE2NH0.gDAvwzxfDRnbpQpxAiogVJbLcOtylXVyMb1hXG9NpGA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});
