"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

type PaymentResultClientProps = {
  orderId?: string;
};

type PaymentStatusResponse = {
  status?: string;
};

function resolveStatusLabel(status?: string) {
  switch (status) {
    case "PAID":
      return "Thanh toan thanh cong";
    case "FAILED":
      return "Thanh toan that bai";
    case "REFUNDED":
      return "Da hoan tien";
    case "CANCELLED":
      return "Don hang da huy";
    default:
      return "Dang cho xac nhan";
  }
}

function resolveStatusIcon(status?: string) {
  switch (status) {
    case "PAID":
      return "OK";
    case "FAILED":
      return "FAIL";
    case "REFUNDED":
      return "REFUND";
    case "CANCELLED":
      return "CANCEL";
    default:
      return "WAIT";
  }
}

export default function PaymentResultClient({ orderId }: PaymentResultClientProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Thieu ma don hang");
      return;
    }

    let isMounted = true;
    apiClient("/payment/status", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    })
      .then((data: PaymentStatusResponse) => {
        if (!isMounted) return;
        setStatus(data?.status || "PENDING");
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message || "Khong the lay trang thai thanh toan");
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (error) {
    return (
      <main className="container page" style={{ paddingTop: 40, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>FAIL</div>
          <h1 style={{ marginBottom: 12 }}>Khong the xac nhan thanh toan</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>{error}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/orders" className="btn-primary">
              Xem don hang
            </Link>
            <Link href="/" className="btn-outline">
              Ve trang chu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="container page" style={{ paddingTop: 40, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>WAIT</div>
          <h1 style={{ marginBottom: 12 }}>Dang xac nhan thanh toan</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            He thong dang kiem tra trang thai giao dich.
          </p>
        </div>
      </main>
    );
  }

  const isSuccess = status === "PAID";

  return (
    <main className="container page" style={{ paddingTop: 40, textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{resolveStatusIcon(status)}</div>
        <h1 style={{ marginBottom: 12 }}>{resolveStatusLabel(status)}</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          {isSuccess
            ? "Don hang cua ban da duoc ghi nhan thanh toan."
            : "Thanh toan chua hoan tat. Ban co the thu lai trong trang don hang."}
        </p>
        {orderId ? (
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Ma don: <strong style={{ color: "var(--text)" }}>{orderId}</strong>
          </p>
        ) : null}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/orders" className="btn-primary">
            Xem don hang
          </Link>
          <Link href="/" className="btn-outline">
            Ve trang chu
          </Link>
        </div>
      </div>
    </main>
  );
}
