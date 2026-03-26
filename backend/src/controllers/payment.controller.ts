import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { OrderRepository } from "../repositories/order.repository";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { AuthRequest } from "../middlewares/auth";
import { OrderService } from "../services/order.service";

export class PaymentController {
  private static resolveVNPayOrderId(vnp_Params: Record<string, any>) {
    const orderInfo = typeof vnp_Params["vnp_OrderInfo"] === "string" ? vnp_Params["vnp_OrderInfo"] : "";
    if (orderInfo) return orderInfo;

    const txnRef = typeof vnp_Params["vnp_TxnRef"] === "string" ? vnp_Params["vnp_TxnRef"] : "";
    return txnRef || "";
  }

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
    try {
      const vnp_Params = req.query as Record<string, any>;
      logger.info("Received VNPay IPN Callback", vnp_Params);

      const isValid = PaymentService.verifyVNPaySignature(vnp_Params);
      if (!isValid) {
        logger.error("VNPay Signature Verification Failed", vnp_Params);
        return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
      }

      const resolvedOrderId = PaymentController.resolveVNPayOrderId(vnp_Params);
      if (!resolvedOrderId) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      const order = await OrderRepository.findById(resolvedOrderId);
      if (!order) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      if (order.paymentStatus === "PAID") {
        logger.warn(`Idempotency: Order ${order.id} is already marked as PAID`);
        return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      }

      const vnpAmount = Number(vnp_Params["vnp_Amount"]) / 100;
      if (!Number.isFinite(vnpAmount) || Math.abs(vnpAmount - order.totalPrice) > 0.01) {
        logger.error("VNPay amount mismatch", { resolvedOrderId, vnpAmount, totalPrice: order.totalPrice });
        return res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
      }

      const responseCode = vnp_Params["vnp_ResponseCode"];
      if (responseCode === "00") {
        await OrderRepository.updatePaymentStatus(resolvedOrderId, "PAID");
      } else {
        await OrderRepository.updateById(resolvedOrderId, { paymentStatus: "FAILED", status: "PENDING" });
      }

      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    } catch (error) {
      next(error);
    }
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

  static async vnpayReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const vnp_Params = req.query as Record<string, any>;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      const isValid = PaymentService.verifyVNPaySignature(vnp_Params);
      if (!isValid) {
        logger.error("VNPay Return Signature Verification Failed", vnp_Params);
        return res.redirect(`${baseUrl}/payment/result?status=failed&reason=invalid-signature`);
      }

      const resolvedOrderId = PaymentController.resolveVNPayOrderId(vnp_Params);
      if (!resolvedOrderId) {
        return res.redirect(`${baseUrl}/payment/result?status=failed&reason=missing-order`);
      }

      const order = await OrderRepository.findById(resolvedOrderId);
      if (!order) {
        return res.redirect(`${baseUrl}/payment/result?status=failed&reason=order-not-found&orderId=${encodeURIComponent(resolvedOrderId)}`);
      }

      const vnpAmount = Number(vnp_Params["vnp_Amount"]) / 100;
      if (!Number.isFinite(vnpAmount) || Math.abs(vnpAmount - order.totalPrice) > 0.01) {
        logger.error("VNPay amount mismatch on return", { resolvedOrderId, vnpAmount, totalPrice: order.totalPrice });
        return res.redirect(`${baseUrl}/payment/result?status=failed&reason=amount-mismatch&orderId=${encodeURIComponent(resolvedOrderId)}`);
      }

      const responseCode = vnp_Params["vnp_ResponseCode"];
      if (responseCode === "00") {
        await OrderRepository.updatePaymentStatus(resolvedOrderId, "PAID");
        return res.redirect(`${baseUrl}/payment/result?status=success&orderId=${encodeURIComponent(resolvedOrderId)}`);
      }

      await OrderRepository.updateById(resolvedOrderId, { paymentStatus: "FAILED", status: "PENDING" });
      return res.redirect(`${baseUrl}/payment/result?status=failed&orderId=${encodeURIComponent(resolvedOrderId)}&code=${encodeURIComponent(responseCode ?? "")}`);
    } catch (error) {
      next(error);
    }
  }

  static async momoCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body as { orderId?: string };
      if (!orderId) {
        return sendError(res, "Thiếu mã đơn hàng", null, 400);
      }

      const order = await OrderService.getOrderById(orderId);
      if (!order || order.userId !== req.user!.userId) {
        return sendError(res, "Không tìm thấy đơn hàng", null, 404);
      }

      if (order.paymentMethod !== "MOMO") {
        return sendError(res, "Đơn hàng không hỗ trợ thanh toán lại", null, 400);
      }

      if (order.status !== "PENDING") {
        return sendError(res, "Đơn hàng không ở trạng thái thanh toán", null, 400);
      }

      const paymentUrl = await PaymentService.createMoMoPayment(order);
      return sendSuccess(res, { paymentUrl }, "Tạo lại thanh toán thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "MoMo create failed";
      return sendError(res, message, null, 400);
    }
  }

  static async vnpayCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body as { orderId?: string };
      if (!orderId) {
        return sendError(res, "Thiếu mã đơn hàng", null, 400);
      }

      const order = await OrderService.getOrderById(orderId);
      if (!order || order.userId !== req.user!.userId) {
        return sendError(res, "Không tìm thấy đơn hàng", null, 404);
      }

      if (order.paymentMethod !== "VNPAY") {
        return sendError(res, "Đơn hàng không hỗ trợ thanh toán lại", null, 400);
      }

      if (order.status !== "PENDING") {
        return sendError(res, "Đơn hàng không ở trạng thái thanh toán", null, 400);
      }

      const ipAddr =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
      const paymentUrl = await PaymentService.createVNPayPayment(order, ipAddr);
      return sendSuccess(res, { paymentUrl }, "Tạo lại thanh toán thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "VNPay create failed";
      return sendError(res, message, null, 400);
    }
  }
}
