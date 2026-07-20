// Public Supabase config. The "anon" key below is DESIGNED to be public and
// visible in browser source - it is not a secret. Supabase protects your data
// with Row Level Security policies (see supabase/schema.sql), not by hiding
// this key. Never put your service_role key anywhere in this js/ folder or
// any other file the browser loads - that one is a real secret and only
// belongs in Vercel's environment variables, used by the api/ functions.
//
// Get both values from: Supabase dashboard -> Project Settings -> API.

const SUPABASE_URL = "https://mffdywnyskenqwvdshhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZmR5d255c2tlbnF3dmRzaGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzY3NzgsImV4cCI6MjEwMDE1Mjc3OH0.MLgamLh1uP9cR8NRFrUtTGAcg1BcjAWMHO1omypT1Aw";
