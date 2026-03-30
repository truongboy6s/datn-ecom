"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { AuthShowcase } from "@/components/auth/AuthShowcase";

type ResetPasswordClientProps = {
  token: string;
};

export default function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("Thieu token dat lai mat khau.");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await authService.resetPassword({ token, password });
      setMessage(res?.message || "Dat lai mat khau thanh cong.");
    } catch (err: any) {
      setError(err.message || "Loi dat lai mat khau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-shell">
      <AuthShowcase
        title="Tao mat khau moi"
        points={["Cap nhat mat khau an toan", "Tiep tuc mua sam va theo doi don hang", "Bao ve tai khoan ca nhan"]}
      />
      <section className="auth-page">
        <h1>Dat lai mat khau</h1>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Mat khau moi
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Toi thieu 6 ky tu"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Dang xu ly..." : "Dat lai mat khau"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          Da co tai khoan?{" "}
          <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Dang nhap</Link>
        </p>
      </section>
    </main>
  );
}
