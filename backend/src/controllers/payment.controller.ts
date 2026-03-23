import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { OrderRepository } from "../repositories/order.repository";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { AuthRequest } from "../middlewares/auth";
import { OrderService } from "../services/order.service";

export class PaymentController {
  static async momoWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Received MoMo IPN Callback", req.body);
      
      const isValid = PaymentService.verifyMoMoSignature(req.body);
      if (!isValid) {
        logger.error("MoMo Signature Verification Failed", req.body);
        return sendError(res, "Chu ky khong hop le", null, 400);
      }

      const { orderId, resultCode, amount, extraData } = req.body;
      let resolvedOrderId = orderId;
      if (typeof extraData === "string" && extraData.length > 0) {
        try {
          const parsed = JSON.parse(Buffer.from(extraData, "base64").toString("utf8"));
          if (parsed?.orderId) {
            resolvedOrderId = parsed.orderId;
          }
        } catch {
          // ignore malformed extraData
        }
      }

      const order = await OrderRepository.findById(resolvedOrderId);

      if (!order) {
        return sendError(res, "Khong tim thay don hang", null, 404);
      }

      // Idempotency check: Ignore re-delivered webhook if already paid
      if (order.paymentStatus === "PAID") {
        logger.warn(`Idempotency: Order ${order.id} is already marked as PAID`);
        return res.status(204).send(); // Acknowledge Webhook blindly
      }

      const momoAmount = Number(amount);
      if (!Number.isFinite(momoAmount) || Math.abs(momoAmount - order.totalPrice) > 0.01) {
        logger.error("MoMo amount mismatch", { orderId, momoAmount, totalPrice: order.totalPrice });
        return sendError(res, "So tien khong khop", null, 400);
      }

      if (resultCode === 0) {
        await OrderRepository.updatePaymentStatus(resolvedOrderId, "PAID");
        logger.info(`Order ${order.id} payment status updated to PAID`);
      } else {
        await OrderRepository.updateById(resolvedOrderId, { paymentStatus: "FAILED", status: "PENDING" });
        logger.info(`Order ${order.id} payment status updated to FAILED`);
      }

      return res.status(204).send(); // Momo requires 204 No Content for successful IPN
    } catch (error) {
      next(error);
    }
  }

  static async vnpayWebhook(req: Request, res: Response, next: NextFunction) {
    // VNPay Implementation is similar
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  }

  static async momoReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.query as any;
      const isValid = PaymentService.verifyMoMoSignature(data);
      if (!isValid) {
        logger.error("MoMo Return Signature Verification Failed", data);
        return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/orders`);
      }

      const { orderId, resultCode, amount, extraData } = data;
      let resolvedOrderId = orderId as string;
      if (typeof extraData === "string" && extraData.length > 0) {
        try {
          const parsed = JSON.parse(Buffer.from(extraData, "base64").toString("utf8"));
          if (parsed?.orderId) {
            resolvedOrderId = parsed.orderId;
          }
        } catch {
          // ignore malformed extraData
        }
      }

      const order = await OrderRepository.findById(resolvedOrderId);
      if (!order) {
        return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/orders`);
      }

      const momoAmount = Number(amount);
      if (!Number.isFinite(momoAmount) || Math.abs(momoAmount - order.totalPrice) > 0.01) {
        logger.error("MoMo amount mismatch on return", { resolvedOrderId, momoAmount, totalPrice: order.totalPrice });
        return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/orders`);
      }

      if (Number(resultCode) === 0) {
        await OrderRepository.updatePaymentStatus(resolvedOrderId, "PAID");
      } else {
        await OrderRepository.updateById(resolvedOrderId, { paymentStatus: "FAILED", status: "PENDING" });
      }

      return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/orders`);
    } catch (error) {
      next(error);
    }
  }

  static async momoCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body as { orderId?: string };
      if (!orderId) {
        return sendError(res, "Thieu ma don hang", null, 400);
      }

      const order = await OrderService.getOrderById(orderId);
      if (!order || order.userId !== req.user!.userId) {
        return sendError(res, "Khong tim thay don hang", null, 404);
      }

      if (order.paymentMethod !== "MOMO") {
        return sendError(res, "Don hang khong ho tro thanh toan lai", null, 400);
      }

      if (order.status !== "PENDING") {
        return sendError(res, "Don hang khong o trang thai thanh toan", null, 400);
      }

      const paymentUrl = await PaymentService.createMoMoPayment(order);
      return sendSuccess(res, { paymentUrl }, "Tao lai thanh toan thanh cong");
    } catch (error) {
      const message = error instanceof Error ? error.message : "MoMo create failed";
      return sendError(res, message, null, 400);
    }
  }
}
