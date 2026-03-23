import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  GMAIL_USER: z.string().email(),
  GMAIL_PASS: z.string().min(1),
  ADMIN_SECRET: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  BACKEND_BASE_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  MOMO_PARTNER_CODE: z.string().optional(),
  MOMO_ACCESS_KEY: z.string().optional(),
  MOMO_SECRET_KEY: z.string().optional(),
  MOMO_ENDPOINT: z.string().optional(),
  VNP_TMNCODE: z.string().optional(),
  VNP_HASH_SECRET: z.string().optional(),
  VNP_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
