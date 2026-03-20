import { prisma } from "../config/db";

export class ReviewRepository {
  static async findByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findFirst({
      where: { userId, productId },
    });
  }

  static async create(data: { userId: string; productId: string; rating: number; comment?: string | null }) {
    return prisma.review.create({
      data,
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
