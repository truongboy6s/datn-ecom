import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";

export class ReviewController {
  static async listByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId as string | undefined;
      if (!productId) {
        return sendError(res, "Thieu productId", null, 400);
      }

      const reviews = await ReviewService.listByProduct(productId);
      return sendSuccess(res, reviews, "Lay danh gia thanh cong");
    } catch (error) {
      next(error);
    }
  }

  static async getEligibility(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId as string | undefined;
      if (!productId) {
        return sendError(res, "Thieu productId", null, 400);
      }

      const eligibility = await ReviewService.canReview(req.user!.userId, productId);
      return sendSuccess(res, eligibility, "Kiem tra dieu kien thanh cong");
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, rating, comment } = req.body as {
        productId: string;
        rating: number;
        comment?: string | null;
      };

      const review = await ReviewService.create(req.user!.userId, productId, rating, comment);
      return sendSuccess(res, review, "Tao danh gia thanh cong", 201);
    } catch (error: any) {
      if (error.message?.includes("danh gia") || error.message?.includes("giao")) {
        return sendError(res, error.message, null, 400);
      }
      next(error);
    }
  }
}
