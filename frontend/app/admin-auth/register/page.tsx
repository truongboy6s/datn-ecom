"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function AdminRegisterPage() {
  const { register, loading, error } = useAuthContext();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await register({ name, email, password, role: "ADMIN", adminSecret });
      setMessage(`Tạo admin thành công. Vui lòng xác thực email: ${email}`);
      setName("");
      setPassword("");
      setAdminSecret("");
      setTimeout(() => {
        router.push("/admin-auth/login");
      }, 1500);
    } catch {
      setMessage("");
    }
  };

  return (
    <main className="container admin-auth-shell page">
      <section className="admin-auth-side">
        <p className="hero-tag">⚙️ Admin Portal</p>
        <h1>Tạo tài khoản quản trị</h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>
          Thiết lập tài khoản để truy cập dashboard vận hành và phân tích.
        </p>
        <ul style={{ listStyle: "none", padding: 0, marginTop: 20, display: "grid", gap: 10 }}>
          <li style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8" }}>
            <span style={{ color: "#ff8a4c" }}>✓</span> Quản lý toàn bộ hệ thống
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8" }}>
            <span style={{ color: "#ff8a4c" }}>✓</span> Phân quyền nhân viên
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8" }}>
            <span style={{ color: "#ff8a4c" }}>✓</span> Xem báo cáo AI chi tiết
          </li>
        </ul>
      </section>

      <section className="admin-auth-card">
        <h2>📝 Admin Sign Up</h2>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            👤 Họ tên
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Admin Name" />
          </label>
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
                minLength={6}
                placeholder="Tối thiểu 6 ký tự"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>
          <label>
            🗝️ Admin secret
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              required
              placeholder="Nhập ADMIN_SECRET"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo tài khoản admin →"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          Đã có tài khoản?{" "}
          <Link href="/admin-auth/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Đăng nhập admin</Link>
        </p>
      </section>
    </main>
  );
}
