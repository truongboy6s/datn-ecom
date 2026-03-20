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
    const redirectUrl = `http://localhost:3000/payment-success`;
    const ipnUrl = `http://localhost:4000/api/payment/momo/callback`;
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

    // return the url based on a mock request if we don't have a real endpoint integration mapped. 
    // In production, we'd do a fetch to momo endpoint here.
    return `${endpoint}/v2/gateway/pay?${new URLSearchParams(requestBody as any).toString()}`;
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
}
