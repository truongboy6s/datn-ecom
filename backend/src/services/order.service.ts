import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../repositories/product.repository";
import { DiscountRepository } from "../repositories/discount.repository";
import { prisma } from "../config/db";

export class OrderService {
  static async createOrder(
    userId: string,
    paymentMethod: any,
    items: { productId: string; quantity: number }[],
    discountCode?: string
  ) {
    let totalPrice = 0;
    const validatedItems: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const item of items) {
      const product = await ProductRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Product ${product.name} out of stock`);
      }

      const price = product.price;
      totalPrice += price * item.quantity;

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
      });
    }

    let discountToApply = 0;
    let matchedDiscountId: string | null = null;

    if (discountCode) {
      const discount = await DiscountRepository.findActiveByCode(discountCode);
      if (!discount) {
        throw new Error("Discount code is invalid or expired");
      }
      if (discount.maxUses !== null && discount.usesCount >= discount.maxUses) {
        throw new Error("Discount code has reached its usage limit");
      }

      discountToApply =
        discount.discountType === "percentage"
          ? (totalPrice * discount.discount) / 100
          : discount.discount;

      discountToApply = Math.min(discountToApply, totalPrice);
      matchedDiscountId = discount.id;
    }

    const finalTotal = Math.max(totalPrice - discountToApply, 0);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of validatedItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error(`Product ${item.productId} out of stock`);
        }
      }

      const created = await tx.order.create({
        data: {
          userId,
          totalPrice: finalTotal,
          paymentMethod,
          items: { create: validatedItems },
        },
        include: { items: true },
      });

      if (matchedDiscountId) {
        await tx.discount.update({
          where: { id: matchedDiscountId },
          data: { usesCount: { increment: 1 } },
        });
      }

      return created;
    });

    return order;
  }

  static async getUserOrders(userId: string) {
    return OrderRepository.findByUserId(userId);
  }

  static async getOrderById(orderId: string) {
    return OrderRepository.findById(orderId);
  }

  static async updateOrder(orderId: string, data: { status?: string; paymentStatus?: string }) {
    return OrderRepository.updateById(orderId, data);
  }
}
