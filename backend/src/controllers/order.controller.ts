import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { PaymentService } from "../services/payment.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { items, paymentMethod, discountCode } = req.body;

      const order = await OrderService.createOrder(userId, paymentMethod, items, discountCode);

      let paymentUrl = null;
      if (paymentMethod === "MOMO") {
        paymentUrl = await PaymentService.createMoMoPayment(order);
      } else if (paymentMethod === "VNPAY") {
        paymentUrl = await PaymentService.createVNPayPayment(order, req.ip || "127.0.0.1");
      }

      return sendSuccess(res, { order, paymentUrl }, "Order created successfully", 201);
    } catch (error: any) {
      if (
        error.message.includes("out of stock") ||
        error.message.includes("not found") ||
        error.message.toLowerCase().includes("discount")
      ) {
        return sendError(res, error.message, null, 400);
      }
      next(error);
    }
  }

  static async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getUserOrders(req.user!.userId);
      return sendSuccess(res, orders, "Orders fetched successfully");
    } catch (error) {
      next(error);
    }
  }
}
