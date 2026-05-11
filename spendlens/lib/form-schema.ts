import { z } from "zod";

export const toolEntrySchema = z.object({
  toolId: z.string().min(1),
  plan: z.string().min(1),
  monthlySpend: z.coerce.number().min(0),
  seats: z.coerce.number().int().positive(),
  useCase: z.enum(["individual", "api", "mixed"]).default("individual"),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly")
});

export const auditInputSchema = z.object({
  teamSize: z.coerce.number().int().positive(),
  startupCreditsUsed: z.coerce.boolean().optional().default(false),
  tools: z.array(toolEntrySchema).min(1).max(20)
});

export const leadSchema = z.object({
  auditId: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional()
});

export type AuditInputForm = z.infer<typeof auditInputSchema>;
