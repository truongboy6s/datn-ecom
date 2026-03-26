"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
  const params = useSearchParams();
  const status = params.get("status");
  const orderId = params.get("orderId");
  const code = params.get("code");
  const isSuccess = status === "success";

  return (
    <main className="container page" style={{ paddingTop: 40, textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {isSuccess ? "✅" : "❌"}
        </div>
        <h1 style={{ marginBottom: 12 }}>
          {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          {isSuccess
            ? "Đơn hàng của bạn đã được ghi nhận thanh toán."
            : "Thanh toán chưa hoàn tất. Bạn có thể thử lại trong trang đơn hàng."}
        </p>
        {orderId ? (
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Mã đơn: <strong style={{ color: "var(--text)" }}>{orderId}</strong>
          </p>
        ) : null}
        {!isSuccess && code ? (
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Mã lỗi: <strong style={{ color: "var(--text)" }}>{code}</strong>
          </p>
        ) : null}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/orders" className="btn-primary">
            Xem đơn hàng
          </Link>
          <Link href="/" className="btn-outline">
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}