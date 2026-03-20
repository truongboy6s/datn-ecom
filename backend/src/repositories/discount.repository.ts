import { prisma } from "../config/db";

export class DiscountRepository {
  static async findAll() {
    return prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async findActiveByCode(code: string) {
    return prisma.discount.findFirst({
      where: {
        code: { equals: code.trim(), mode: "insensitive" },
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  static async incrementUses(id: string) {
    return prisma.discount.update({
      where: { id },
      data: { usesCount: { increment: 1 } },
    });
  }

  static async create(data: {
    code: string;
    description?: string | null;
    discount: number;
    discountType: "percentage" | "fixed";
    maxUses?: number | null;
    usesCount?: number;
    isActive?: boolean;
    expiresAt?: Date | null;
  }) {
    return prisma.discount.create({
      data,
    });
  }

  static async updateById(
    id: string,
    data: Partial<{
      description: string | null;
      discount: number;
      discountType: "percentage" | "fixed";
      maxUses: number | null;
      usesCount: number;
      isActive: boolean;
      expiresAt: Date | null;
    }>
  ) {
    return prisma.discount.update({
      where: { id },
      data,
    });
  }

  static async deleteById(id: string) {
    return prisma.discount.delete({
      where: { id },
    });
  }
}
