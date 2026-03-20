import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error on ${req.method} ${req.originalUrl}: ${err.message}`, err.stack);

  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", err.flatten().fieldErrors, 400);
  }

  // Handle common Prisma or other custom errors here if needed
  if (err.name === 'UnauthorizedError') {
    return sendError(res, "Unauthorized", null, 401);
  }

  // Fallback
  return sendError(res, "Internal server error", null, 500);
};
