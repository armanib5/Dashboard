/* Same Supabase project as map.board's /admin/ - one admin login works
   here and there. Safe to commit: the anon key is public-facing, Row
   Level Security (map.board's supabase/schema.sql) controls who can
   read/write what, not secrecy of this key. */
var SUPABASE_URL = "https://pjjbuabekqhkpzpllfaz.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqamJ1YWJla3Foa3B6cGxsZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0Nzc4MjIsImV4cCI6MjA5OTA1MzgyMn0.WjfPNss77ixKao1U19QZy_H3QttW_XFd3Yzv5uKdbz8";
