import "server-only";
import { serverEnv } from "@/lib/env";
import { logError } from "@/lib/errors";
import { absoluteUrl, siteConfig } from "@/config/site";

type Email = { to: string; subject: string; html: string; text: string; headers?: Record<string, string> };

/**
 * Transactional e-mail through Resend's HTTP API (no SDK needed).
 * Auth e-mails (verification, password reset) are sent by Supabase Auth itself.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const { resendApiKey, emailFrom } = serverEnv();
  if (!newsletterEmailAvailable()) {
    if (process.env.NODE_ENV !== "production") console.info("[email:dev] Newsletter e-mail is disabled until RESEND_API_KEY and EMAIL_FROM are configured.");
    else logError("sendEmail", "Newsletter e-mail is not configured");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: emailFrom, ...email }),
    });
    if (!res.ok) throw new Error(`Resend request failed with status ${res.status}`);
    return true;
  } catch (error) {
    logError("sendEmail", error);
    return false;
  }
}

export function newsletterEmailAvailable(): boolean {
  const { resendApiKey, emailFrom } = serverEnv();
  return Boolean(resendApiKey && emailFrom);
}

function layout(body: string, unsubscribeUrl?: string) {
  return `<!doctype html><html><body style="margin:0;background:#08090c;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#eceef2">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:32px 16px">
<table width="100%" style="max-width:520px;background:#0e1015;border:1px solid #1f232c;border-radius:14px" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="padding:28px">
<p style="margin:0 0 20px;font-weight:600;font-size:18px">Heist<span style="color:#e8b84a">Match</span></p>
${body}
</td></tr></table>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#6b7280">${siteConfig.disclaimer}${
    unsubscribeUrl ? `<br><a href="${unsubscribeUrl}" style="color:#9aa1ad">Unsubscribe</a>` : ""
  }</p>
</td></tr></table></body></html>`;
}

export function newsletterConfirmEmail(confirmToken: string, unsubscribeToken: string): Omit<Email, "to"> {
  const confirmUrl = absoluteUrl(`/newsletter/confirm?token=${confirmToken}`);
  const unsubscribeUrl = absoluteUrl(`/unsubscribe?token=${unsubscribeToken}`);
  return {
    subject: "Confirm your HeistMatch subscription",
    text: `Confirm your subscription to GTA 6 news, heist updates and new guides from HeistMatch:\n\n${confirmUrl}\n\nDidn't sign up? Ignore this e-mail and you won't hear from us.`,
    html: layout(
      `<h1 style="margin:0 0 12px;font-size:20px">Confirm your subscription</h1>
<p style="margin:0 0 24px;line-height:1.6;color:#c4c8d0">One click and you'll get GTA 6 news, heist updates and new guides straight to your inbox.</p>
<a href="${confirmUrl}" style="display:inline-block;background:#e8b84a;color:#1a1305;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Confirm subscription</a>
<p style="margin:24px 0 0;font-size:13px;color:#9aa1ad">Didn't sign up? Ignore this e-mail and you won't hear from us.</p>`,
      unsubscribeUrl,
    ),
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
  };
}
