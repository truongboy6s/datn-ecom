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

      return sendSuccess(res, { order, paymentUrl }, "Tạo đơn hàng thành công", 201);
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
      return sendSuccess(res, orders, "Lấy danh sách đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  static async retryMoMoPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id;
      const orderId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!orderId) {
        return sendError(res, "Thieu ma don hang", null, 400);
      }
      const order = await OrderService.getOrderById(orderId);

      if (!order || order.userId !== req.user!.userId) {
        return sendError(res, "Khong tim thay don hang", null, 404);
      }

      if (order.paymentMethod !== "MOMO") {
        return sendError(res, "Đơn hàng không hỗ trợ thanh toán lại", null, 400);
      }

      if (order.paymentStatus !== "FAILED" || order.status !== "PENDING") {
        return sendError(res, "Đơn hàng không ở trạng thái thanh toán lại", null, 400);
      }

      const paymentUrl = await PaymentService.createMoMoPayment(order);
      return sendSuccess(res, { paymentUrl }, "Tạo lại đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id;
      const orderId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!orderId) {
        return sendError(res, "Thieu ma don hang", null, 400);
      }

      const order = await OrderService.getOrderById(orderId);
      if (!order || order.userId !== req.user!.userId) {
        return sendError(res, "Khong tim thay don hang", null, 404);
      }

      if (order.status !== "PENDING") {
        return sendError(res, "Đơn hàng không thể hủy ở trạng thái hiện tại", null, 400);
      }

      if (order.paymentStatus === "PAID" && order.paymentMethod === "MOMO") {
        await PaymentService.refundMoMoPayment(order);
        const updated = await OrderService.updateOrder(orderId, {
          status: "CANCELLED",
          paymentStatus: "REFUNDED",
        });
        return sendSuccess(res, updated, "Hủy đơn và hoàn tiền thành công");
      }

      const updated = await OrderService.updateOrder(orderId, {
        status: "CANCELLED",
        paymentStatus: "FAILED",
      });
      return sendSuccess(res, updated, "Hủy đơn thành công");
    } catch (error) {
      next(error);
    }
  }
}
