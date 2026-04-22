import { z } from "zod";

import { DEFAULT_CHARITY_PERCENTAGE, SCORE_MAX, SCORE_MIN } from "@/lib/constants";

export const authSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  charityId: z.string().uuid(),
  contributionPercentage: z.coerce.number().min(DEFAULT_CHARITY_PERCENTAGE).max(100)
});

export const signInSchema = authSchema.pick({
  email: true,
  password: true
});

export const scoreSchema = z.object({
  playedAt: z.string().min(1),
  score: z.coerce.number().int().min(SCORE_MIN).max(SCORE_MAX)
});

export const charitySelectionSchema = z.object({
  charityId: z.string().uuid(),
  contributionPercentage: z.coerce.number().min(DEFAULT_CHARITY_PERCENTAGE).max(100)
});

export const donationSchema = z.object({
  charityId: z.string().uuid(),
  amount: z.coerce.number().positive().max(10000),
  note: z.string().max(200).optional()
});

export const checkoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"])
});

export const drawConfigSchema = z.object({
  drawMonth: z.string().min(1),
  logicType: z.enum(["random", "algorithmic"]),
  notes: z.string().max(500).optional()
});

export const winnerReviewSchema = z.object({
  winnerId: z.string().uuid(),
  status: z.enum(["pending_verification", "approved", "rejected", "paid"])
});
