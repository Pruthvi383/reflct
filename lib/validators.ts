import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters")
});

export const signupSchema = authSchema.extend({
  username: z
    .string()
    .min(3, "Use at least 3 characters")
    .max(24, "Keep it under 24 characters")
    .regex(/^[a-z0-9_]+$/i, "Use letters, numbers, and underscores")
});

export const onboardingSchema = z.object({
  learning_goal: z.string().min(2, "Share what you're learning"),
  reminder_time: z.string().min(1, "Pick a reminder time"),
  username: z
    .string()
    .min(3, "Choose a username")
    .max(24, "Keep it under 24 characters")
    .regex(/^[a-z0-9_]+$/i, "Use letters, numbers, and underscores")
});

const entryBaseSchema = z.object({
  week_start: z.string(),
  learnings: z.string(),
  focus_rating: z.number().min(1).max(5).nullable(),
  blocker: z.string().nullable(),
  next_goal: z.string(),
  prev_goal_met: z.boolean().nullable(),
  is_locked: z.boolean().optional()
});

export const entryDraftSchema = entryBaseSchema;

export const entrySubmitSchema = entryBaseSchema.superRefine((value, ctx) => {
  if (value.learnings.trim().length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["learnings"],
      message: "Capture a little more detail before locking this week."
    });
  }

  if (value.next_goal.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["next_goal"],
      message: "Set one next goal before locking this week."
    });
  }
});

export const settingsSchema = z.object({
  reminder_time: z.string().optional(),
  is_public: z.boolean().optional(),
  learning_goal: z.string().optional(),
  username: z.string().optional()
});

export const focusSessionSchema = z.object({
  label: z.string().min(2, "Add a session label"),
  duration: z.number().min(1),
  quality: z.enum(["PRODUCTIVE", "OKAY", "DISTRACTED"]),
  started_at: z.string(),
  ended_at: z.string()
});
