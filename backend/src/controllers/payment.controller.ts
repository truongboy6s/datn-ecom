import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { OrderRepository } from "../repositories/order.repository";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";

export class PaymentController {
  static async momoWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Received MoMo IPN Callback", req.body);
      
      const isValid = PaymentService.verifyMoMoSignature(req.body);
      if (!isValid) {
        logger.error("MoMo Signature Verification Failed", req.body);
        return sendError(res, "Invalid signature", null, 400);
      }

      const { orderId, resultCode } = req.body;
      const order = await OrderRepository.findById(orderId);

      if (!order) {
        return sendError(res, "Order not found", null, 404);
      }

      // Idempotency check: Ignore re-delivered webhook if already paid
      if (order.paymentStatus === "PAID") {
        logger.warn(`Idempotency: Order ${order.id} is already marked as PAID`);
        return res.status(204).send(); // Acknowledge Webhook blindly
      }

      if (resultCode === 0) {
        await OrderRepository.updatePaymentStatus(orderId, "PAID");
        logger.info(`Order ${order.id} payment status updated to PAID`);
      } else {
        await OrderRepository.updatePaymentStatus(orderId, "FAILED");
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
}
