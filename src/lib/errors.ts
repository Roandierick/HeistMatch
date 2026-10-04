// Maps database/business-rule error codes (raised in SQL triggers and RPCs)
// to user-facing messages. Unknown errors never leak internals.

const MESSAGES: Record<string, string> = {
  too_many_active_listings: "You already have 2 active listings. Close one before creating another.",
  rate_limited: "You're doing that too often. Try again in a little while.",
  invalid_start_time: "Pick a start time between now and 14 days from now.",
  invalid_heist_type: "That heist is not available. Pick another one.",
  account_banned: "Your account can't do this right now. Contact support if you think this is a mistake.",
  heist_not_found: "This listing no longer exists.",
  heist_not_open: "This listing is no longer open to join.",
  heist_full: "This crew is already full.",
  is_host: "You're hosting this heist.",
  blocked: "You can't join this listing.",
  kicked: "The host removed you from this crew.",
  not_authenticated: "Sign in to continue.",
  players_needed_below_joined: "You can't need fewer players than have already joined.",
  listing_closed: "This listing is closed.",
  invalid_status: "That status change isn't allowed.",
};

export function friendlyDbError(error: { message?: string; code?: string } | null | undefined): string {
  if (!error) return "Something went wrong. Please try again.";
  const key = error.message?.trim() ?? "";
  if (MESSAGES[key]) return MESSAGES[key];
  if (error.code === "23505") return "That already exists.";
  if (error.code === "42501") return "You don't have permission to do that.";
  return "Something went wrong. Please try again.";
}

export function logError(scope: string, error: unknown) {
  // Centralised server logging; swap for a log drain/Sentry without touching call sites.
  console.error(`[heistmatch:${scope}]`, error instanceof Error ? error.message : error);
}
