import { z } from "zod";
import { LANGUAGES, PLATFORMS, REGIONS, values } from "@/config/options";
import { checkUserText, cleanText } from "@/lib/moderation";
import { usernameSchema } from "@/lib/validation/auth";

const optionalHandle = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v),
    z.string().min(2).max(max).regex(/^[^\s<>]+( [^\s<>]+)*$/, { error: "Use a valid handle." }).nullable(),
  );

export const profileSchema = z.object({
  username: usernameSchema,
  platform: z.enum(values(PLATFORMS)),
  region: z.enum(values(REGIONS)),
  primary_language: z.enum(values(LANGUAGES)),
  bio: z.preprocess(
    (v) => (typeof v === "string" ? cleanText(v) : v),
    z
      .string()
      .max(280, { error: "Keep your bio under 280 characters." })
      .superRefine((text, ctx) => {
        const r = checkUserText(text);
        if (!r.ok) ctx.addIssue({ code: "custom", message: r.reason });
      }),
  ),
  platform_handle: optionalHandle(32),
  discord_handle: optionalHandle(37),
});
