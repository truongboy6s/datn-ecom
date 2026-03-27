import { z } from "zod";

export const getProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

export const searchProductsSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required").max(200),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(["relevance", "price", "newest", "best-selling"]).default("relevance"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    categoryId: z.string().uuid().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  }),
});

export const autocompleteSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(200),
    limit: z.coerce.number().int().min(1).max(20).default(8),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    categoryId: z.string().uuid(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")).optional(),
    categoryId: z.string().uuid().optional(),
  }),
});
