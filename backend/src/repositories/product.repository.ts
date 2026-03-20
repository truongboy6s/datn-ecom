import { prisma } from "../config/db";

export class ProductRepository {
  static async findAll(skip: number, take: number) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    return { products, total };
  }

  static async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  static async create(data: any) {
    return prisma.product.create({
      data,
      include: { category: true },
    });
  }

  static async updateById(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  static async deleteById(id: string) {
    return prisma.product.delete({
      where: { id },
      include: { category: true },
    });
  }
}
