"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { AuthShowcase } from "@/components/auth/AuthShowcase";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("Thiếu token đặt lại mật khẩu.");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await authService.resetPassword({ token, password });
      setMessage(res?.message || "Đặt lại mật khẩu thành công.");
    } catch (err: any) {
      setError(err.message || "Lỗi đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-shell">
      <AuthShowcase
        title="Tạo mật khẩu mới"
        points={["Cập nhật mật khẩu an toàn", "Tiếp tục mua sắm và theo dõi đơn hàng", "Bảo vệ tài khoản cá nhân"]}
      />
      <section className="auth-page">
        <h1>Đặt lại mật khẩu</h1>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            🔐 Mật khẩu mới
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Tối thiểu 6 ký tự"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          Đã có tài khoản?{" "}
          <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
