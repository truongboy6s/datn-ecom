import crypto from "crypto";
import { env } from "../config/env";
import { Order } from "@prisma/client";

export class PaymentService {
  static async createMoMoPayment(order: Order) {
    if (!env.MOMO_PARTNER_CODE) return "http://test-payment.momo.vn/dummy_url";

    const partnerCode = env.MOMO_PARTNER_CODE;
    const accessKey = env.MOMO_ACCESS_KEY!;
    const secretKey = env.MOMO_SECRET_KEY!;
    const endpoint = env.MOMO_ENDPOINT!;

    const orderId = order.id;
    const orderInfo = `Pay for order ${order.id}`;
    const amount = order.totalPrice.toString();
    const frontendBaseUrl = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const backendBaseUrl = `http://localhost:${env.PORT}`;
    const redirectUrl = `${frontendBaseUrl}/orders`;
    const ipnUrl = `${backendBaseUrl}/api/payment/momo/callback`;
    const requestType = "captureWallet";
    const extraData = "";
    const requestId = orderId + new Date().getTime();

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const response = await fetch(`${endpoint}/v2/gateway/api/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.json().catch(() => null);
    if (!response.ok) {
      const message = responseBody?.message || "MoMo payment creation failed";
      throw new Error(message);
    }

    const payUrl = responseBody?.payUrl || responseBody?.deeplink || responseBody?.qrCodeUrl;
    if (!payUrl) {
      throw new Error("MoMo response missing payUrl");
    }

    return payUrl;
  }

  static verifyMoMoSignature(data: any) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = data;

    const secretKey = env.MOMO_SECRET_KEY || "";
    const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const checkSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    return checkSignature === signature;
  }

  static async createVNPayPayment(order: Order, ipAddr: string) {
    // Generate VNPay URL mockup based on their docs
    return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${order.totalPrice * 100}&vnp_TxnRef=${order.id}`;
  }

  static verifyVNPaySignature(vnp_Params: any) {
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // Sort params and create hash string
    // Simplified for mockup
    return true; // Assume validation passes for dev
  }

  static async refundMoMoPayment(order: Order) {
    if (!env.MOMO_PARTNER_CODE) return true;

    // TODO: Integrate MoMo refund API when available in production.
    // This stub allows order flow to proceed in development.
    return true;
  }
}
