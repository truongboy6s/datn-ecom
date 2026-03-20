import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

// A basic in-memory store for idempotency keys. 
// For production, consider using Redis.
const idempotencyStore = new Set<string>();

export const idempotency = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers["x-idempotency-key"] as string;

  if (!idempotencyKey) {
    return sendError(res, "Missing x-idempotency-key header", null, 400);
  }

  if (idempotencyStore.has(idempotencyKey)) {
    logger.warn(`Duplicate request prevented for idempotency key: ${idempotencyKey}`);
    return sendError(res, "Request is already processing or completed", null, 409);
  }

  idempotencyStore.add(idempotencyKey);

  // Clear the key after some time to avoid memory leak or use Redis SETNX with TTL.
  // 5 minutes TTL for in-memory example.
  setTimeout(() => {
    idempotencyStore.delete(idempotencyKey);
  }, 5 * 60 * 1000);

  next();
};
