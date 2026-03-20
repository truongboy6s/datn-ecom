import { prisma } from "../config/db";

export class CategoryRepository {
  static async findAllWithCounts() {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });

    return categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    }));
  }

  static async create(data: { name: string; slug: string; description?: string | null }) {
    return prisma.category.create({
      data,
    });
  }

  static async updateById(id: string, data: { name?: string; slug?: string; description?: string | null }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteById(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
