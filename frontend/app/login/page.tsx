"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { useAuthContext } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, loading, error } = useAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await login({ email, password });
      setMessage(`Đăng nhập thành công: ${result.user.name}`);
      
      // Redirect to home after 1.5s
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      setMessage("");
    }
  };

  return (
    <main className="container auth-shell">
      <AuthShowcase
        title="Đăng nhập để nhận ưu đãi"
        points={[
          "Theo dõi đơn hàng theo thời gian thực",
          "Nhận deal cá nhân hóa theo lịch sử mua sắm",
          "Lưu sản phẩm yêu thích và giỏ hàng"
        ]}
      />
      <section className="auth-page">
        <h1>Đăng nhập</h1>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            📧 Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" />
          </label>
          <label>
            🔒 Mật khẩu
            <div className="input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Đang xử lý..." : "Đăng nhập →"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        <p style={{ color: "var(--muted)", fontSize: ".9rem", marginTop: 8 }}>
          <Link href="/forgot-password" style={{ color: "var(--brand)", fontWeight: 600 }}>Quên mật khẩu?</Link>
        </p>
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          Chưa có tài khoản?{" "}
          <Link href="/register" style={{ color: "var(--brand)", fontWeight: 600 }}>Đăng ký ngay</Link>
        </p>
      </section>
    </main>
  );
}
