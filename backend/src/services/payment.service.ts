import crypto from "crypto";
import { env } from "../config/env";
import { Order } from "@prisma/client";
import qs from "qs";

export class PaymentService {
  static async createMoMoPayment(order: Order) {
    if (!env.MOMO_PARTNER_CODE) return "http://test-payment.momo.vn/dummy_url";

    const partnerCode = env.MOMO_PARTNER_CODE;
    const accessKey = env.MOMO_ACCESS_KEY!;
    const secretKey = env.MOMO_SECRET_KEY!;
    const endpoint = env.MOMO_ENDPOINT!;

    const orderId = `${order.id}-${Date.now()}`;
    const orderInfo = `Pay for order ${order.id}`;
    const amount = Math.round(order.totalPrice).toString();
    const frontendBaseUrl = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const backendBaseUrl = env.BACKEND_BASE_URL || `http://localhost:${env.PORT}`;
    const redirectUrl = `${backendBaseUrl}/api/payment/momo/return`;
    const ipnUrl = `${backendBaseUrl}/api/payment/momo/callback`;
    const requestType = "captureWallet";
    const extraData = Buffer.from(JSON.stringify({ orderId: order.id })).toString("base64");
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

    const rawText = await response.text();
    const responseBody = rawText ? (() => {
      try {
        return JSON.parse(rawText);
      } catch {
        return null;
      }
    })() : null;

    if (!response.ok) {
      const message = responseBody?.message || rawText || "MoMo payment creation failed";
      throw new Error(message);
    }

    const payUrl = responseBody?.payUrl || responseBody?.deeplink || responseBody?.qrCodeUrl;
    if (!payUrl) {
      const detail = responseBody?.message || rawText || "unknown response";
      throw new Error(`MoMo response missing payUrl: ${detail}`);
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
    const vnpTmnCode = env.VNP_TMNCODE;
    const vnpHashSecret = env.VNP_HASH_SECRET;
    const vnpUrl = env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    if (!vnpTmnCode || !vnpHashSecret) {
      return vnpUrl;
    }

    const shortOrderSuffix = order.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6);
    const vnpTxnRef = `ORD${Date.now()}${shortOrderSuffix}`;
    const amount = Math.round(order.totalPrice * 100);
    const backendBaseUrl = env.BACKEND_BASE_URL || `http://localhost:${env.PORT}`;
    const returnUrl = `${backendBaseUrl}/api/payment/vnpay/return`;
    const createDate = new Date();
    const vnpCreateDate = `${createDate.getFullYear()}${(createDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${createDate.getDate().toString().padStart(2, "0")}${createDate
      .getHours()
      .toString()
      .padStart(2, "0")}${createDate.getMinutes().toString().padStart(2, "0")}${createDate
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const normalizedIp = ipAddr?.startsWith("::ffff:")
      ? ipAddr.replace("::ffff:", "")
      : ipAddr === "::1"
        ? "127.0.0.1"
        : ipAddr || "127.0.0.1";

    const vnpParams: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnpTmnCode,
      vnp_Amount: amount.toString(),
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnpTxnRef,
      vnp_OrderInfo: order.id,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: normalizedIp,
      vnp_CreateDate: vnpCreateDate,
      vnp_ExpireDate: "",
      vnp_BankCode: "",
    };

    const filteredParams = Object.entries(vnpParams).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});

    // Temporary log to diagnose VNPay parameter formatting (remove after debugging).
    console.log("[VNPay] Params", filteredParams);

    const sortedParams = Object.keys(filteredParams)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = filteredParams[key];
        return acc;
      }, {});

    const signData = qs.stringify(sortedParams, {
      encode: true,
      encoder: (value) => encodeURIComponent(value).replace(/%20/g, "+"),
    });

    const secureHash = crypto
      .createHmac("sha512", vnpHashSecret)
      .update(signData, "utf-8")
      .digest("hex");

    const query = qs.stringify(
      { ...sortedParams, vnp_SecureHash: secureHash },
      {
        encode: true,
        encoder: (value) => encodeURIComponent(value).replace(/%20/g, "+"),
      }
    );
    const paymentUrl = `${vnpUrl}?${query}`;
    console.log("[VNPay] URL", paymentUrl);
    return paymentUrl;
  }

  static verifyVNPaySignature(vnp_Params: any) {
    const secureHash = vnp_Params["vnp_SecureHash"];
    const vnpHashSecret = env.VNP_HASH_SECRET || "";

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
       acc[key] = vnp_Params[key];
        return acc;
      }, {});

    const signData = qs.stringify(sortedParams, {
      encode: true,
      encoder: (value) => encodeURIComponent(value).replace(/%20/g, "+"),
    });

    const checkSignature = crypto
      .createHmac("sha512", vnpHashSecret)
      .update(signData, "utf-8")
      .digest("hex");

    console.log("SIGN DATA:", signData);
    console.log("VNPay HASH:", secureHash);
    console.log("LOCAL HASH:", checkSignature);

    return secureHash === checkSignature;
  }

  static async refundMoMoPayment(order: Order) {
    if (!env.MOMO_PARTNER_CODE) return true;

    // TODO: Integrate MoMo refund API when available in production.
    // This stub allows order flow to proceed in development.
    return true;
  }
}
