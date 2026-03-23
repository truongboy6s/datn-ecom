import { apiRequest } from "@/services/api-client";
import type { Order } from "@/types/domain";

export interface CreateOrderPayload {
  paymentMethod: "COD" | "MOMO" | "VNPAY";
  items: Array<{ productId: string; quantity: number }>;
  discountCode?: string;
}

export interface CreateOrderResult {
  order: Order;
  paymentUrl: string | null;
}

export interface RetryPaymentResult {
  paymentUrl: string | null;
}

export const orderService = {
  list(token?: string) {
    return apiRequest<{ data: Order[] }>("/orders", { token });
  },

  create(payload: CreateOrderPayload, token?: string) {
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `idempo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return apiRequest<{ data: CreateOrderResult }>("/orders", {
      method: "POST",
      headers: { "x-idempotency-key": idempotencyKey },
      token,
      body: JSON.stringify(payload)
    });
  },

  createMoMoPayment(orderId: string, token?: string) {
    return apiRequest<{ data: RetryPaymentResult }>("/payment/momo/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      token,
      body: JSON.stringify({ orderId }),
    });
  },

  cancelOrder(orderId: string, token?: string) {
    return apiRequest<{ data: Order }>(`/orders/${orderId}/cancel`, {
      method: "POST",
      token,
    });
  }
};
