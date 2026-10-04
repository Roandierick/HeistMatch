import { z } from "zod";
import { LANGUAGES, PLATFORMS, REGIONS, values } from "@/config/options";

export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_]{3,20}$/, { error: "3–20 characters: letters, numbers and underscores." });

const email = z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid e-mail address." }).max(254));
const password = z
  .string()
  .min(10, { error: "Use at least 10 characters." })
  .max(72, { error: "Use at most 72 characters." });

export const signUpSchema = z.object({
  email,
  password,
  username: usernameSchema,
  platform: z.enum(values(PLATFORMS), { error: "Pick your platform." }),
  region: z.enum(values(REGIONS), { error: "Pick your region." }),
  language: z.enum(values(LANGUAGES), { error: "Pick your language." }),
  marketing_opt_in: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  accept_terms: z.literal("on", { error: "You need to accept the Terms and Privacy Policy." }),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password." }).max(72),
});

export const forgotPasswordSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], error: "Passwords don't match." });
