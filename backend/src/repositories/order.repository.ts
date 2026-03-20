import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export class OrderRepository {
  static async createOrder(
    userId: string,
    totalPrice: number,
    paymentMethod: any,
    items: { productId: string; quantity: number; price: number }[]
  ) {
    return prisma.order.create({
      data: {
        userId,
        totalPrice,
        paymentMethod,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
    });
  }

  static async updatePaymentStatus(id: string, status: any) {
    return prisma.order.update({
      where: { id },
      data: { paymentStatus: status },
    });
  }

  static async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findAll() {
    return prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateById(id: string, data: any) {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
