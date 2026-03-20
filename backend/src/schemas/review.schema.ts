import { z } from "zod";

export const listReviewsSchema = z.object({
  query: z.object({
    productId: z.string().uuid(),
  }),
});

export const reviewEligibilitySchema = z.object({
  query: z.object({
    productId: z.string().uuid(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional().nullable(),
  }),
});
