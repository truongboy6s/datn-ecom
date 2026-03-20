"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Token xác thực không tìm thấy.");
        return;
      }

      try {
        const result = await apiClient(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(result.message || "Email xác thực thành công!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Lỗi xác thực email. Token có thể hết hạn.");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <main className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
      <section className="auth-page" style={{ maxWidth: "500px", margin: "0 auto" }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
            <h1>Đang xác thực email...</h1>
            <p style={{ color: "var(--muted)" }}>Vui lòng chờ trong giây lát.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
            <h1>Xác thực thành công!</h1>
            <p style={{ color: "var(--muted)", marginBottom: "20px" }}>{message}</p>
            <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
              Bạn sẽ được chuyển hướng tới trang đăng nhập trong giây lát...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
            <h1>Xác thực thất bại</h1>
            <p style={{ color: "var(--muted)", marginBottom: "30px" }}>{message}</p>
            <button 
              onClick={() => router.push("/register")}
              className="btn-primary"
            >
              Quay lại Đăng ký
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function VerifyEmailFallback() {
  return (
    <main className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
      <section className="auth-page" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
        <h1>Đang xác thực email...</h1>
        <p style={{ color: "var(--muted)" }}>Vui lòng chờ trong giây lát.</p>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
