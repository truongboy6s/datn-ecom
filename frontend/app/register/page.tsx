"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { useAuthContext } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, loading, error } = useAuthContext();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await register({ name, email, password });
      setMessage(`Đăng ký thành công! Vui lòng check email ${email} để xác thực tài khoản.`);
      setStep("verify");
      setName("");
      setPassword("");
    } catch {
      setMessage("");
    }
  };

  const onVerifiedClick = () => {
    router.push("/login");
  };

  return (
    <main className="container auth-shell">
      <AuthShowcase
        title="Tạo tài khoản mới"
        points={[
          "Nhận voucher 200K cho đơn hàng đầu tiên",
          "Tích điểm thành viên và thăng hạng ưu đãi",
          "Nhận thông báo flash sale theo sở thích"
        ]}
      />
      <section className="auth-page">
        {step === "form" ? (
          <>
            <h1>Đăng ký tài khoản</h1>
            <form onSubmit={onSubmit} className="auth-form">
              <label>
                👤 Họ tên
                <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Nguyễn Văn A" />
              </label>
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
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Đang xử lý..." : "Đăng ký →"}
              </button>
            </form>
            {error ? <p className="error-text">{error}</p> : null}
          </>
        ) : (
          <>
            <h1>Xác thực Email</h1>
            <div className="auth-form" style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✉️</div>
              <h2 style={{ marginBottom: "10px" }}>Kiểm tra Email của Bạn</h2>
              <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
                Chúng tôi đã gửi liên kết xác thực tới{" "}
                <strong style={{ color: "var(--text)" }}>{email}</strong>
              </p>
              <p style={{ color: "var(--muted)", marginBottom: "30px" }}>
                Vui lòng nhấp vào liên kết trong email để xác thực tài khoản của bạn.
              </p>
              <p style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: "20px" }}>
                Link xác thực sẽ hết hạn sau 24 giờ.
              </p>
              <button 
                onClick={onVerifiedClick} 
                className="btn-primary"
                style={{ marginTop: "20px" }}
              >
                Đã xác thực? Đi tới Đăng nhập →
              </button>
            </div>
          </>
        )}

        <p style={{ color: "var(--muted)", fontSize: ".9rem", marginTop: "20px" }}>
          Đã có tài khoản?{" "}
          <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
