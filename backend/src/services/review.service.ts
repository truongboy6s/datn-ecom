import { prisma } from "../config/db";
import { OrderStatus } from "@prisma/client";
import { ReviewRepository } from "../repositories/review.repository";

export class ReviewService {
  static async listByProduct(productId: string) {
    return ReviewRepository.findByProductId(productId);
  }

  static async canReview(userId: string, productId: string) {
    const existing = await ReviewRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      return { canReview: false, reason: "ALREADY_REVIEWED" };
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: OrderStatus.DELIVERED,
        },
      },
    });

    if (!orderItem) {
      return { canReview: false, reason: "NOT_DELIVERED" };
    }

    return { canReview: true, reason: "OK" };
  }

  static async create(userId: string, productId: string, rating: number, comment?: string | null) {
    const eligibility = await this.canReview(userId, productId);
    if (!eligibility.canReview) {
      const message =
        eligibility.reason === "ALREADY_REVIEWED"
          ? "Ban da danh gia san pham nay"
          : "Don hang chua duoc giao cho san pham nay";
      throw new Error(message);
    }

    return ReviewRepository.create({
      userId,
      productId,
      rating,
      comment: comment ?? null,
    });
  }
}
