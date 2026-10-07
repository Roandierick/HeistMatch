import { z } from "zod";
import { REPORT_REASONS, values } from "@/config/options";
import { cleanText } from "@/lib/moderation";

export const NEWSLETTER_SOURCES = ["newsletter_home", "newsletter_blog", "newsletter_article", "account_settings"] as const;

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid e-mail address." }).max(254)),
  source: z.enum(NEWSLETTER_SOURCES).default("newsletter_home"),
  // Honeypot: real users never fill this hidden field.
  company: z.string().max(200).optional(),
});

export const reportSchema = z
  .object({
    target_type: z.enum(["heist", "user"]),
    target_id: z.uuid(),
    reason: z.enum(values(REPORT_REASONS), { error: "Pick a reason." }),
    details: z.preprocess(
      (v) => (typeof v === "string" ? cleanText(v) || undefined : v),
      z.string().max(500, { error: "Keep it under 500 characters." }).optional(),
    ),
  });

export const analyticsEventSchema = z.object({
  name: z.string().regex(/^[a-z]+(_[a-z]+)*$/).max(48),
  path: z.string().max(300).optional(),
  referrer: z.string().max(500).optional(),
  session_id: z.string().regex(/^[a-zA-Z0-9-]{8,64}$/).optional(),
  props: z.record(z.string().max(40), z.union([z.string().max(120), z.number(), z.boolean(), z.null()])).optional(),
});
