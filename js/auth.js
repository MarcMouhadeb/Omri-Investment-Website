// Shared auth helpers, used by login.html, signup.html, account.html, and
// education.html. Depends on supabase-config.js and the Supabase JS CDN
// script both being loaded first (see the <script> order in each page).

const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function omriSignUp(email, password) {
  const { error } = await sbClient.auth.signUp({ email, password });
  return error;
}

async function omriSignIn(email, password) {
  const { error } = await sbClient.auth.signInWithPassword({ email, password });
  return error;
}

async function omriSignOut() {
  await sbClient.auth.signOut();
}

async function omriGetSession() {
  const { data } = await sbClient.auth.getSession();
  return data.session;
}

// Reads a query-string param, e.g. omriQueryParam('redirect')
function omriQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Swaps the nav's "Login" link for "My Account" when a session exists.
// Call this on every page after the DOM is ready (see nav <a id="nav-auth-link">).
async function omriUpdateNavAuthLink() {
  const link = document.getElementById('nav-auth-link');
  if (!link) return;
  const session = await omriGetSession();
  if (session) {
    link.textContent = 'My Account';
    link.setAttribute('href', 'account.html');
  }
}
