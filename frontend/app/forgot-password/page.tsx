"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { AuthShowcase } from "@/components/auth/AuthShowcase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await authService.forgotPassword({ email });
      setMessage(res?.message || "Nếu email tồn tại, liên kết đặt lại mật khẩu sẽ được gửi.");
    } catch (err: any) {
      setError(err.message || "Lỗi gửi yêu cầu đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-shell">
      <AuthShowcase
        title="Khôi phục mật khẩu"
        points={["Nhận liên kết đặt lại mật khẩu qua Gmail", "Bảo mật tài khoản của bạn", "Tiếp tục mua sắm nhanh chóng"]}
      />
      <section className="auth-page">
        <h1>Quên mật khẩu</h1>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            📧 Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Đang gửi..." : "Gửi liên kết"}
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
