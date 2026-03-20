import { z } from "zod";

export const createDiscountSchema = z.object({
  body: z.object({
    code: z.string().min(2),
    description: z.string().optional().nullable(),
    discount: z.number().positive(),
    discountType: z.enum(["percentage", "fixed"]),
    maxUses: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const updateDiscountSchema = z.object({
  body: z.object({
    description: z.string().optional().nullable(),
    discount: z.number().positive().optional(),
    discountType: z.enum(["percentage", "fixed"]).optional(),
    maxUses: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});
