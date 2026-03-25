import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";
import type { AuthRequest } from "../middlewares/auth";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, "User registered. Check email to verify account.", 201);
    } catch (error: any) {
      if (error.message === "Email already registered") {
        return sendError(res, error.message, null, 409);
      }
      if (error.message === "Invalid admin secret") {
        return sendError(res, error.message, null, 403);
      }
      if (error.message.includes("Unable to send verification email")) {
        return sendError(res, error.message, null, 503);
      }
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      if (!token) {
        return sendError(res, "Verification token is required", null, 400);
      }

      const result = await AuthService.verifyEmail(token as string);
      return sendSuccess(res, result, "Email verified successfully", 200);
    } catch (error: any) {
      if (error.message.includes("expired") || error.message.includes("Invalid")) {
        return sendError(res, error.message, null, 400);
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      // Setting HttpOnly Cookie
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, { user: result.user }, "Login successful");
    } catch (error: any) {
      if (error.message.includes("credentials") || error.message.includes("not verified")) {
        return sendError(res, error.message, null, 401);
      }
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, "Unauthorized", null, 401);
      }

      const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string };
      const user = await AuthService.updateProfile(userId, { name, avatarUrl });
      return sendSuccess(res, { user }, "Profile updated successfully");
    } catch (error: any) {
      if (error.message === "No profile fields provided") {
        return sendError(res, error.message, null, 400);
      }
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body as { email: string };
      const result = await AuthService.requestPasswordReset(email);
      return sendSuccess(res, result, "Yêu cầu đặt lại mật khẩu đã được gửi");
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body as { token: string; password: string };
      const result = await AuthService.resetPassword(token, password);
      return sendSuccess(res, result, "Đặt lại mật khẩu thành công");
    } catch (error: any) {
      if (error.message?.includes("token")) {
        return sendError(res, error.message, null, 400);
      }
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, "Unauthorized", null, 401);
      }
      const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      return sendSuccess(res, result, "Đổi mật khẩu thành công");
    } catch (error: any) {
      if (error.message?.includes("Mật khẩu")) {
        return sendError(res, error.message, null, 400);
      }
      next(error);
    }
  }
}
