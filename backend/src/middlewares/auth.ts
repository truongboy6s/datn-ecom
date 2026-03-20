import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";
import { env } from "../config/env";
import { Role } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;
  if (!token) {
    return sendError(res, "Missing or invalid authorization cookie", null, 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    return sendError(res, "Invalid token", null, 401);
  }
};

export const authorize = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Forbidden: insufficient permissions", null, 403);
    }
    next();
  };
};
