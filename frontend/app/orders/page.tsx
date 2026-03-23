"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { reviewService } from "@/services/review.service";
import { orderService } from "@/services/order.service";

const ORDER_STEPS = ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao"];
const ORDER_STATUS_STEPS = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];

function getOrderStatusIndex(status: string) {
  return ORDER_STATUS_STEPS.indexOf(status);
}

function getStatusChipClass(status: string) {
  switch (status) {
    case "DELIVERED": return "status-chip status-chip--completed";
    case "SHIPPING": return "status-chip status-chip--processing";
    case "CONFIRMED": return "status-chip status-chip--processing";
    case "CANCELLED": return "status-chip status-chip--cancelled";
    default: return "status-chip status-chip--pending";
  }
}

function getPaymentChipClass(status: string) {
  switch (status) {
    case "PAID": return "status-chip status-chip--paid";
    case "REFUNDED": return "status-chip status-chip--refunded";
    case "FAILED": return "status-chip status-chip--failed";
    default: return "status-chip status-chip--pending";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "DELIVERED": return "Đã giao";
    case "SHIPPING": return "Đang giao";
    case "CONFIRMED": return "Đã xác nhận";
    case "CANCELLED": return "Đã hủy";
    case "PENDING": return "Chờ xác nhận";
    case "PAID": return "Đã thanh toán";
    case "FAILED": return "Thanh toán thất bại";
    case "REFUNDED": return "Đã hoàn tiền";
    default: return status;
  }
}

function orderStatusLabel(status: string, paymentStatus: string) {
  if (status === "PENDING" && paymentStatus === "FAILED") {
    return "Chờ thanh toán lại";
  }
  if (status === "PENDING" && paymentStatus === "PENDING") {
    return "Chờ thanh toán";
  }
  return statusLabel(status);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewStates, setReviewStates] = useState<Record<string, { rating: number; comment: string; open: boolean; submitting: boolean; error?: string }>>({});
  const [reviewedProductIds, setReviewedProductIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiClient("/orders")
      .then(res => {
        setOrders(res.data || []);
      })
      .catch(err => {
        setError(err.message || "Failed to fetch orders. Ensure you are logged in.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <main className="container page"><p style={{ textAlign: "center", padding: "80px" }}>Đang tải đơn hàng...</p></main>;

  if (error) {
    return (
      <main className="container page" style={{ textAlign: "center", padding: "80px" }}>
        <h2 style={{ color: "red" }}>{error}</h2>
        <Link href="/login" className="btn-primary" style={{ marginTop: "20px", display: "inline-block" }}>Đăng nhập ngay</Link>
      </main>
    );
  }

  return (
    <main className="container page">
      <h1>📦 Theo dõi đơn hàng</h1>
      <p className="page-subtitle">{orders.length} đơn hàng</p>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>Bạn chưa có đơn hàng nào.</p>
      ) : null}

      <div className="order-list">
        {orders.map((order) => {
          const stepIndex = getOrderStatusIndex(order.status);
          const isCancelled = order.status === "CANCELLED";

          return (
            <div key={order.id} className="order-card">
              <div className="order-card__header">
                <div>
                  <span className="order-card__id">{order.id}</span>
                  <span className="order-card__date" style={{ marginLeft: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "2-digit", year: "numeric"
                    })}
                  </span>
                </div>
                <span className={getStatusChipClass(order.status)}>
                  {orderStatusLabel(order.status, order.paymentStatus)}
                </span>
              </div>

              {/* Timeline */}
              {!isCancelled ? (
                <div className="order-timeline">
                  {ORDER_STEPS.map((step, i) => {
                    const isCompleted = i < stepIndex;
                    const isActive = i === stepIndex;
                    return (
                      <div
                        key={step}
                        className={`order-timeline__step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                      >
                        <div className="order-timeline__dot">
                          {isCompleted ? "✓" : i + 1}
                        </div>
                        <span className="order-timeline__label">{step}</span>
                        {i < ORDER_STEPS.length - 1 ? <div className="order-timeline__line" /> : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "var(--danger)", fontWeight: 500, margin: "10px 0" }}>
                  ✕ Đơn hàng đã bị hủy
                </p>
              )}

              {/* Details */}
              <div className="order-card__details">
                <div className="order-card__detail">
                  <span>Tổng tiền: </span>
                  <strong style={{ color: "var(--brand-dark)" }}>
                    {order.totalPrice.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
                <div className="order-card__detail">
                  <span>Thanh toán: </span>
                  <strong>{order.paymentMethod}</strong>
                </div>
                <div className="order-card__detail">
                  <span>Trạng thái TT: </span>
                  <span className={getPaymentChipClass(order.paymentStatus)}>
                    {statusLabel(order.paymentStatus)}
                  </span>
                </div>
                {order.status === "PENDING" ? (
                  <div className="order-card__detail" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(order.paymentStatus === "FAILED" || order.paymentStatus === "PENDING") && order.paymentMethod === "MOMO" ? (
                      <button
                        className="btn-sm"
                        onClick={async () => {
                          try {
                            const res = await orderService.createMoMoPayment(order.id);
                            const paymentUrl = res?.data?.paymentUrl;
                            if (paymentUrl) {
                              window.location.href = paymentUrl;
                            }
                          } catch (err: any) {
                            setError(err.message || "Khong the tao lai thanh toan.");
                          }
                        }}
                      >
                        Thanh toán lại
                      </button>
                    ) : null}
                    <button
                      className="btn-sm btn-outline"
                      onClick={async () => {
                        try {
                          const res = await orderService.cancelOrder(order.id);
                          const updated = res?.data;
                          if (updated) {
                            setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
                          }
                        } catch (err: any) {
                          setError(err.message || "Khong the huy don.");
                        }
                      }}
                    >
                      Hủy đơn
                    </button>
                  </div>
                ) : null}
                {order.status === "DELIVERED" ? (
                  <div className="order-card__detail">
                    <button className="btn-sm btn-outline" disabled>
                      Yeu cau hoan hang
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Items */}
              {order.items && order.items.length > 0 ? (
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: 10
                    }}>
                      <img
                        src={item.product?.imageUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=44&q=80"}
                        alt={item.product?.name || "Product"}
                        style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: ".88rem" }}>{item.product?.name || "Sản phẩm không xác định"}</p>
                        <p style={{ margin: 0, fontSize: ".8rem", color: "var(--muted)" }}>
                          {item.quantity} × {item.price.toLocaleString("vi-VN")}₫
                        </p>
                        {order.status === "DELIVERED" && item.product?.id ? (
                          <div style={{ marginTop: 8 }}>
                            {reviewedProductIds[item.product.id] ? (
                              <span style={{ color: "var(--success)", fontSize: ".82rem" }}>✓ Đã đánh giá</span>
                            ) : (
                              <button
                                className="btn-sm"
                                onClick={() => {
                                  setReviewStates((prev) => ({
                                    ...prev,
                                    [item.product.id]: {
                                      rating: prev[item.product.id]?.rating ?? 5,
                                      comment: prev[item.product.id]?.comment ?? "",
                                      open: true,
                                      submitting: false,
                                    }
                                  }));
                                }}
                              >
                                ✍️ Đánh giá
                              </button>
                            )}
                          </div>
                        ) : null}
                        {order.status === "DELIVERED" && item.product?.id && reviewStates[item.product.id]?.open ? (
                          <div style={{ marginTop: 8 }}>
                            {reviewStates[item.product.id]?.error ? (
                              <p style={{ color: "#ef4444", fontSize: ".82rem", margin: "6px 0" }}>
                                {reviewStates[item.product.id]?.error}
                              </p>
                            ) : null}
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <label style={{ fontSize: ".82rem" }}>
                                Sao
                                <select
                                  value={reviewStates[item.product.id]?.rating ?? 5}
                                  onChange={(e) =>
                                    setReviewStates((prev) => ({
                                      ...prev,
                                      [item.product.id]: {
                                        rating: Number(e.target.value),
                                        comment: prev[item.product.id]?.comment ?? "",
                                        open: true,
                                        submitting: prev[item.product.id]?.submitting ?? false,
                                      },
                                    }))
                                  }
                                  style={{ marginLeft: 6 }}
                                >
                                  {[5, 4, 3, 2, 1].map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                  ))}
                                </select>
                              </label>
                              <button
                                className="btn-sm"
                                onClick={async () => {
                                  setReviewStates((prev) => ({
                                    ...prev,
                                    [item.product.id]: {
                                      rating: prev[item.product.id]?.rating ?? 5,
                                      comment: prev[item.product.id]?.comment ?? "",
                                      open: true,
                                      submitting: true,
                                    },
                                  }));
                                  try {
                                    await reviewService.create({
                                      productId: item.product.id,
                                      rating: reviewStates[item.product.id]?.rating ?? 5,
                                      comment: reviewStates[item.product.id]?.comment ?? "",
                                    });
                                    setReviewedProductIds((prev) => ({ ...prev, [item.product.id]: true }));
                                    setReviewStates((prev) => ({
                                      ...prev,
                                      [item.product.id]: {
                                        rating: prev[item.product.id]?.rating ?? 5,
                                        comment: "",
                                        open: false,
                                        submitting: false,
                                      },
                                    }));
                                  } catch (err: any) {
                                    let message = err.message || "Lỗi gửi đánh giá.";
                                    try {
                                      const parsed = JSON.parse(err.message);
                                      if (parsed?.message) message = parsed.message;
                                    } catch {
                                      // ignore
                                    }
                                    setReviewStates((prev) => ({
                                      ...prev,
                                      [item.product.id]: {
                                        rating: prev[item.product.id]?.rating ?? 5,
                                        comment: prev[item.product.id]?.comment ?? "",
                                        open: true,
                                        submitting: false,
                                        error: message,
                                      },
                                    }));
                                  }
                                }}
                                disabled={reviewStates[item.product.id]?.submitting}
                              >
                                {reviewStates[item.product.id]?.submitting ? "Đang gửi..." : "Gửi"}
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={reviewStates[item.product.id]?.comment ?? ""}
                              onChange={(e) =>
                                setReviewStates((prev) => ({
                                  ...prev,
                                  [item.product.id]: {
                                    rating: prev[item.product.id]?.rating ?? 5,
                                    comment: e.target.value,
                                    open: true,
                                    submitting: prev[item.product.id]?.submitting ?? false,
                                  },
                                }))
                              }
                              placeholder="Chia sẻ cảm nhận của bạn"
                              style={{ width: "100%", marginTop: 6, resize: "vertical" }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </main>
  );
}
