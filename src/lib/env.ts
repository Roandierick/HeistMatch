// Public env is inlined at build time; server env is read lazily so a missing
// optional key (e-mail, service role) never breaks rendering of public pages.

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export function hasSupabaseEnv(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function serverEnv() {
  return {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    emailFrom: process.env.EMAIL_FROM ?? "",
    cronSecret: process.env.CRON_SECRET ?? "",
    rateLimitSalt: process.env.RATE_LIMIT_SALT ?? "heistmatch-local-development",
  };
}
