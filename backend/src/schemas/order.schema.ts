import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    ).min(1, "Don hang phai co it nhat mot san pham"),
    paymentMethod: z.enum(["COD", "MOMO", "VNPAY"]),
    discountCode: z.string().min(2).optional(),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"]).optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  }),
});
