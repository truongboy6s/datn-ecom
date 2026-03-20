"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const { login, logout, loading, error } = useAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await login({ email, password });
      if (result.user.role !== "ADMIN") {
        logout();
        setMessage("Tài khoản này không có quyền admin.");
        return;
      }
      setMessage(`Đăng nhập admin thành công: ${result.user.name}`);
      router.push("/admin");
    } catch {
      setMessage("");
    }
  };

  return (
    <main className="container admin-auth-shell page">
      <section className="admin-auth-side">
        <p className="hero-tag">⚙️ Admin Portal</p>
        <h1>Đăng nhập hệ thống quản trị</h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>
          Quản lý danh mục, đơn hàng, doanh thu và phân tích kinh doanh AI.
        </p>
        <ul style={{ listStyle: "none", padding: 0, marginTop: 20, display: "grid", gap: 10 }}>
          <li style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8" }}>
            <span style={{ color: "#ff8a4c" }}>✓</span> Dashboard doanh thu trực quan
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8" }}>
            <span style={{ color: "#ff8a4c" }}>✓</span> Quản lý sản phẩm & đơn hàng
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8" }}>
            <span style={{ color: "#ff8a4c" }}>✓</span> AI phân tích kinh doanh thông minh
          </li>
        </ul>
      </section>

      <section className="admin-auth-card">
        <h2>🔐 Admin Sign In</h2>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            📧 Email quản trị
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@company.com" />
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập admin →"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          Chưa có tài khoản quản trị?{" "}
          <Link href="/admin-auth/register" style={{ color: "var(--brand)", fontWeight: 600 }}>Đăng ký admin</Link>
        </p>
      </section>
    </main>
  );
}
