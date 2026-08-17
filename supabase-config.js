/**
 * Fill these in from your Supabase project:
 * Project Settings -> API -> Project URL / anon public key.
 * Both are safe to expose client-side — access is enforced by
 * Row Level Security policies (see supabase/schema.sql), not by
 * keeping this key secret.
 */
const SUPABASE_URL = 'https://yxvmaqbbtzgddyhsbjqa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3mMIPH4TIMoDmfyVjG3yfA_cD1s-hmT';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
