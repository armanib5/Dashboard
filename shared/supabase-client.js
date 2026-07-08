/* Thin shared wrapper around the Supabase JS client - same pattern as
   map.board/shared/supabase-client.js, copied here so this repo stays
   deployable on its own without depending on map.board's files at
   runtime. */

function isSupabaseConfigured() {
  return typeof SUPABASE_URL === "string" && SUPABASE_URL.indexOf("supabase.co") > 0 &&
    typeof SUPABASE_ANON_KEY === "string" && SUPABASE_ANON_KEY.length > 20;
}

var _sbClient = null;
function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!_sbClient) _sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _sbClient;
}

function renderSupabaseNotConfigured(containerEl, whatFor) {
  containerEl.innerHTML =
    "<div class='sb-notice'>" +
    "<h2>Not connected yet</h2>" +
    "<p>" + (whatFor || "This page") + " needs a Supabase project to work. " +
    "See <code>shared/supabase-config.js</code> - it should hold the same " +
    "Project URL and anon key as map.board's admin.</p>" +
    "</div>";
}
