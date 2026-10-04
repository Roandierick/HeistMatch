import { z } from "zod";
import {
  LANGUAGES, MAX_PLAYERS_NEEDED, PAYOUT_SPLITS, PLATFORMS, PLAYSTYLES, REGIONS, SKILL_LEVELS, values,
} from "@/config/options";
import { checkUserText, cleanText } from "@/lib/moderation";

const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const moderated = (allowEmpty: boolean) =>
  z.string().transform(cleanText).superRefine((text, ctx) => {
    if (!allowEmpty && !text) return;
    const result = checkUserText(text);
    if (!result.ok) ctx.addIssue({ code: "custom", message: result.reason });
  });

export const createHeistSchema = z
  .object({
    title: moderated(false).pipe(
      z.string().min(4, { error: "Give your heist a title of at least 4 characters." }).max(80, { error: "Keep the title under 80 characters." }),
    ),
    heist_type: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Pick a heist." }),
    platform: z.enum(values(PLATFORMS), { error: "Pick a platform." }),
    region: z.enum(values(REGIONS), { error: "Pick a region." }),
    language: z.enum(values(LANGUAGES), { error: "Pick a language." }),
    players_needed: z.coerce
      .number({ error: "How many players do you need?" })
      .int()
      .min(1, { error: "You need at least 1 player." })
      .max(MAX_PLAYERS_NEEDED, { error: `You can look for at most ${MAX_PLAYERS_NEEDED} players.` }),
    mic_required: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
    min_rank: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(8000).optional()),
    skill_level: z.enum(values(SKILL_LEVELS)).default("any"),
    playstyle: z.enum(values(PLAYSTYLES)).default("normal"),
    payout_split: z.preprocess(emptyToUndefined, z.enum(values(PAYOUT_SPLITS)).optional()),
    start_mode: z.enum(["now", "scheduled"]).default("now"),
    start_at: z.preprocess(emptyToUndefined, z.iso.datetime({ offset: true }).optional()),
    description: z.preprocess(
      emptyToUndefined,
      moderated(true).pipe(z.string().max(600, { error: "Keep the description under 600 characters." })).optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.start_mode === "scheduled") {
      if (!data.start_at) {
        ctx.addIssue({ code: "custom", path: ["start_at"], message: "Pick a start time." });
        return;
      }
      const start = new Date(data.start_at).getTime();
      const now = Date.now();
      if (start < now - 5 * 60_000 || start > now + 14 * 24 * 3600_000) {
        ctx.addIssue({ code: "custom", path: ["start_at"], message: "Pick a start time between now and 14 days from now." });
      }
    }
  })
  .transform((data) => ({
    title: data.title,
    heist_type: data.heist_type,
    platform: data.platform,
    region: data.region,
    language: data.language,
    players_needed: data.players_needed,
    mic_required: data.mic_required,
    min_rank: data.min_rank ?? null,
    skill_level: data.skill_level,
    playstyle: data.playstyle,
    payout_split: data.payout_split ?? null,
    start_at: data.start_mode === "scheduled" && data.start_at ? new Date(data.start_at).toISOString() : new Date().toISOString(),
    description: data.description || null,
  }));

export type CreateHeistInput = z.output<typeof createHeistSchema>;

export const heistIdSchema = z.uuid();

export const reviewSchema = z.object({
  heist_id: z.uuid(),
  reviewed_user_id: z.uuid(),
  play_again: z.enum(["yes", "no"]).transform((v) => v === "yes"),
  rating: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(5).optional()),
});
