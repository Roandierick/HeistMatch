// Verifies that the Supabase project behind the current env is ready for sign-ups.
// Usage: npm run check:supabase            (reads .env.local)
//        node scripts/check-supabase.mjs   (reads the process env, e.g. on Vercel)
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

let failed = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const fail = (msg, fix) => {
  failed++;
  console.log(`  FAIL  ${msg}${fix ? `\n        -> ${fix}` : ""}`);
};
const warn = (msg) => console.log(`  note  ${msg}`);

async function get(path, key) {
  const res = await fetch(`${url}${path}`, { headers: { apikey: key, authorization: `Bearer ${key}` } });
  let body = null;
  try {
    body = await res.json();
  } catch {}
  return { status: res.status, body };
}

console.log("Environment");
if (url) ok(`NEXT_PUBLIC_SUPABASE_URL = ${url}`);
else fail("NEXT_PUBLIC_SUPABASE_URL is empty", "Supabase -> Project Settings -> API -> Project URL");
if (anon) ok("NEXT_PUBLIC_SUPABASE_ANON_KEY is set");
else fail("NEXT_PUBLIC_SUPABASE_ANON_KEY is empty", "Supabase -> Project Settings -> API -> anon/publishable key");
if (service) ok("SUPABASE_SERVICE_ROLE_KEY is set");
else fail("SUPABASE_SERVICE_ROLE_KEY is empty", "Supabase -> Project Settings -> API -> service_role/secret key (server only)");
if (!site) fail("NEXT_PUBLIC_SITE_URL is empty", "Set it to your public URL, e.g. https://heistmatch.com");
else if (/localhost|127\.0\.0\.1/.test(site) && !/localhost|127\.0\.0\.1/.test(url))
  warn(`NEXT_PUBLIC_SITE_URL is ${site}; verification links will point there. Use your public URL in production.`);
else ok(`NEXT_PUBLIC_SITE_URL = ${site}`);

if (!url || !anon) {
  console.log("\nCannot reach Supabase without URL and anon key.");
  process.exit(1);
}

console.log("\nAuth settings");
try {
  const { status, body } = await get("/auth/v1/settings", anon);
  if (status !== 200) fail(`/auth/v1/settings returned ${status}`, "Check the URL and anon key");
  else {
    if (body.disable_signup) fail("Sign-ups are disabled", "Authentication -> Sign In / Providers -> enable 'Allow new users to sign up'");
    else ok("New sign-ups are allowed");
    if (!body.external?.email) fail("E-mail provider is disabled", "Authentication -> Sign In / Providers -> Email -> enable");
    else ok("E-mail provider is enabled");
    if (body.mailer_autoconfirm) warn("'Confirm email' is OFF: accounts are active without verifying the address.");
    else ok("'Confirm email' is ON");
  }
} catch (error) {
  fail(`Cannot reach ${url}: ${error.message}`);
}

console.log("\nDatabase (migrations)");
try {
  const { status, body } = await get("/rest/v1/heist_types?select=slug&limit=1", anon);
  if (status === 200 && Array.isArray(body) && body.length) ok("Tables exist and reference data is loaded");
  else if (status === 200) fail("heist_types is empty", "Apply supabase/migrations/20261004000004_reference_data_and_cron.sql");
  else fail(`Tables missing (${body?.code ?? status}: ${body?.message ?? ""})`, "Apply every file in supabase/migrations in order (npx supabase db push, or paste them in the SQL editor)");
} catch (error) {
  fail(`Query failed: ${error.message}`);
}
if (service) {
  try {
    const { status, body } = await get("/rest/v1/profiles?select=id&limit=1", service);
    if (status === 200) ok("Service role key works");
    else fail(`Service role query failed (${body?.code ?? status}: ${body?.message ?? ""})`, "Use the service_role/secret key, not the anon key");
  } catch (error) {
    fail(`Service role query failed: ${error.message}`);
  }
}

console.log("\nCannot be checked from here (Supabase dashboard -> Authentication):");
warn("Custom SMTP: without it Supabase only e-mails your own team members and caps sends per hour.");
warn(`URL Configuration: Site URL = ${site || "<your public URL>"}, Redirect URLs include ${site || "<url>"}/auth/callback and /auth/confirm.`);

console.log(failed ? `\n${failed} problem(s) found.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
