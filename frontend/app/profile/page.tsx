"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, logout, isHydrated, updateProfile } = useAuthContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.avatarUrl) {
        setPreviewUrl(user.avatarUrl);
      }
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File quá lớn. Kích thước tối đa 5MB.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload to a storage service like S3, Cloudinary, etc.
      // For now, we'll use data URL (not recommended for production)
      // TODO: Implement actual file upload to backend
      setMessage("Avatar được cập nhật (preview)");
    } catch (err) {
      setError("Lỗi tải lên avatar.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setError("");
      setMessage("");

      await updateProfile({
        name,
        avatarUrl: previewUrl ?? user?.avatarUrl ?? null,
      });

      setMessage("Thông tin đã được lưu thành công!");
      setIsEditing(false);
    } catch (err) {
      setError("Lỗi lưu thông tin người dùng.");
    }
  };

  if (!isHydrated) {
    return (
      <main className="container page">
        <p style={{ textAlign: "center", padding: "40px" }}>Đang tải...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="container page">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <Link href="/" style={{ color: "var(--brand)", textDecoration: "none", fontSize: ".9rem" }}>
            ← Quay lại trang chủ
          </Link>
        </div>

        <h1 style={{ marginBottom: "30px" }}>Thông tin người dùng</h1>

        {/* Profile Card */}
        <div style={{
          background: "white",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          padding: "30px",
        }}>
          {/* Avatar Section */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: previewUrl || user.avatarUrl
                  ? `url(${previewUrl || user.avatarUrl})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "48px",
                fontWeight: "bold",
                border: "3px solid var(--brand)",
                overflow: "hidden",
              }}
            >
              {!user.avatarUrl && !previewUrl && user.name.charAt(0).toUpperCase()}
            </div>

            {isEditing && (
              <label style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "var(--brand)",
                color: "white",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontSize: ".9rem",
                fontWeight: "500",
                marginTop: "10px",
              }}>
                📸 Đổi Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          {/* Info Section */}
          <div style={{
            display: "grid",
            gap: "20px",
            marginBottom: "30px",
          }}>
            {/* Name Field */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: ".95rem" }}>
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius)",
                    fontSize: ".9rem",
                    boxSizing: "border-box",
                  }}
                  minLength={2}
                />
              ) : (
                <p style={{ margin: 0, color: "var(--text)", padding: "10px 12px", background: "var(--bg-soft)", borderRadius: "var(--radius)" }}>
                  {user.name}
                </p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: ".95rem" }}>
                Email
              </label>
              <p style={{ margin: 0, color: "var(--muted)", padding: "10px 12px", background: "var(--bg-soft)", borderRadius: "var(--radius)" }}>
                {user.email}
              </p>
            </div>

            {/* Role Field (Read-only) */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: ".95rem" }}>
                Vai trò
              </label>
              <p style={{ margin: 0, color: "var(--muted)", padding: "10px 12px", background: "var(--bg-soft)", borderRadius: "var(--radius)" }}>
                {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && <p style={{ color: "#ef4444", marginBottom: "15px", fontSize: ".9rem" }}>❌ {error}</p>}
          {message && <p style={{ color: "#22c55e", marginBottom: "15px", fontSize: ".9rem" }}>✅ {message}</p>}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewUrl(user.avatarUrl || null);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "transparent",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    fontSize: ".9rem",
                    fontWeight: "500",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={uploading}
                  className="btn-primary"
                  style={{ padding: "10px 20px" }}
                >
                  {uploading ? "Đang tải..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
                style={{ padding: "10px 20px" }}
              >
                ✏️ Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "15px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontSize: ".95rem",
            fontWeight: "600",
            marginTop: "30px",
          }}
        >
          🚪 Đăng xuất
        </button>
      </div>
    </main>
  );
}
