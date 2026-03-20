"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { discountService } from "@/services/discount.service";
import { orderService } from "@/services/order.service";
import type { Discount } from "@/types/domain";

type PaymentMethod = "COD" | "MOMO" | "VNPAY";

export default function CheckoutPage() {
  const { items, total, isHydrated, clearCart } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [submitted, setSubmitted] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    discountService
      .listActive()
      .then((res) => {
        if (!active) return;
        setDiscounts(res);
      })
      .catch(() => {
        if (!active) return;
        setDiscounts([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleApplyDiscount = () => {
    if (!selectedDiscountCode) {
      setAppliedDiscount(null);
      return;
    }

    const matched = discounts.find((discount) => discount.code === selectedDiscountCode);
    if (!matched) {
      setAppliedDiscount(null);
      return;
    }

    setAppliedDiscount(matched);
  };

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.discountType === "percentage") {
      return (total * appliedDiscount.discount) / 100;
    }
    return appliedDiscount.discount;
  }, [appliedDiscount, total]);

  const finalTotal = Math.max(total - Math.min(discountAmount, total), 0);

  if (!isHydrated) {
    return (
      <main className="container page" style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ color: "var(--muted)" }}>Đang tải giỏ hàng...</p>
      </main>
    );
  }

  if (items.length === 0 && !submitted) {
    return (
      <main className="container page" style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "3rem", marginBottom: 12 }}>📦</p>
        <h1>Giỏ hàng trống</h1>
        <p style={{ color: "var(--muted)" }}>Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        <Link href="/products" className="btn-primary" style={{ display: "inline-block", marginTop: 16 }}>
          Khám phá sản phẩm
        </Link>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="container page" style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "3rem", marginBottom: 12 }}>✅</p>
        <h1>Đặt hàng thành công!</h1>
        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý.
        </p>
        <div className="actions-row" style={{ justifyContent: "center" }}>
          <Link href="/orders" className="btn-primary">Theo dõi đơn hàng</Link>
          <Link href="/" className="btn-outline">Về trang chủ</Link>
        </div>
      </main>
    );
  }

  const paymentMethods: { key: PaymentMethod; label: string; desc: string; icon: string }[] = [
    { key: "COD", label: "Thanh toán khi nhận hàng (COD)", desc: "Thanh toán tiền mặt khi nhận hàng", icon: "💵" },
    { key: "MOMO", label: "Ví MoMo", desc: "Thanh toán qua ví điện tử MoMo", icon: "📱" },
    { key: "VNPAY", label: "VNPay", desc: "Thanh toán qua cổng VNPay", icon: "🏦" }
  ];

  return (
    <main className="container page">
      <h1>💳 Thanh toán</h1>
      <p className="page-subtitle">Hoàn tất thông tin để đặt hàng</p>
      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      <div className="checkout-layout">
        <div>
          {/* Shipping */}
          <div className="checkout-section">
            <h2>📍 Thông tin giao hàng</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên</label>
                <input placeholder="Nguyễn Văn A" />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input placeholder="0912 345 678" />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Địa chỉ giao hàng</label>
              <input placeholder="Số nhà, tên đường, phường/xã" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quận/Huyện</label>
                <input placeholder="Quận 1" />
              </div>
              <div className="form-group">
                <label>Tỉnh/Thành phố</label>
                <input placeholder="TP. Hồ Chí Minh" />
              </div>
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea placeholder="Ghi chú cho đơn hàng (tùy chọn)" rows={3} style={{ resize: "vertical" }} />
            </div>
          </div>

          {/* Payment */}
          <div className="checkout-section">
            <h2>💰 Phương thức thanh toán</h2>
            <div className="payment-options">
              {paymentMethods.map((method) => (
                <label
                  key={method.key}
                  className={`payment-option ${payment === method.key ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === method.key}
                    onChange={() => setPayment(method.key)}
                  />
                  <span style={{ fontSize: "1.3rem" }}>{method.icon}</span>
                  <div>
                    <p className="payment-option-label">{method.label}</p>
                    <p className="payment-option-desc">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          {items.map((item) => (
            <div key={item.product.id} className="cart-summary-row">
              <span style={{ flex: 1 }}>
                {item.product.name} × {item.quantity}
              </span>
              <span>{(item.product.price * item.quantity).toLocaleString("vi-VN")}₫</span>
            </div>
          ))}
          <div className="cart-summary-row">
            <span>Phí vận chuyển</span>
            <span style={{ color: "var(--success)" }}>Miễn phí</span>
          </div>
          {appliedDiscount ? (
            <div className="cart-summary-row" style={{ color: "var(--success)" }}>
              <span>
                Giảm giá ({appliedDiscount.code})
              </span>
              <span>-{Math.min(discountAmount, total).toLocaleString("vi-VN")}₫</span>
            </div>
          ) : null}
          <div className="cart-summary-total">
            <span>Tổng cộng</span>
            <span style={{ color: "var(--brand-dark)" }}>{finalTotal.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="discount-code-form">
            <select
              value={selectedDiscountCode}
              onChange={(e) => setSelectedDiscountCode(e.target.value)}
            >
              <option value="">Chọn mã giảm giá</option>
              {discounts.map((discount) => (
                <option key={discount.id} value={discount.code}>
                  {discount.code} - {discount.discountType === "percentage"
                    ? `${discount.discount}%`
                    : `${discount.discount.toLocaleString("vi-VN")}₫`}
                </option>
              ))}
            </select>
            <button onClick={handleApplyDiscount} className="btn-sm" disabled={!selectedDiscountCode}>
              Áp dụng
            </button>
          </div>
          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 16 }}
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              try {
                const res = await orderService.create({
                  paymentMethod: payment,
                  items: items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                  })),
                  discountCode: appliedDiscount?.code,
                });
                const paymentUrl = res.data?.paymentUrl;
                if (paymentUrl) {
                  window.location.href = paymentUrl;
                  return;
                }
                clearCart();
                setSubmitted(true);
              } catch (err: any) {
                let message = err.message || "Lỗi tạo đơn hàng.";
                try {
                  const parsed = JSON.parse(err.message);
                  if (parsed?.message) message = parsed.message;
                } catch {
                  // ignore JSON parse failure
                }
                setError(message);
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "Đặt hàng →"}
          </button>
          <Link
            href="/cart"
            className="btn-outline btn-sm"
            style={{ width: "100%", marginTop: 8, display: "block", textAlign: "center" }}
          >
            ← Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    </main>
  );
}
