"use client";

import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";

export function HeroAuthActions() {
  const { user, isHydrated } = useAuthContext();
  
  if (!isHydrated) return null;

  return (
    <div className="actions-row">
      <Link href="/products" className="btn-primary">🛒 Mua ngay</Link>
      {!user ? (
        <Link href="/register" className="btn-outline">🎁 Nhận voucher mới</Link>
      ) : (
        <Link href="/profile" className="btn-outline">Sử dụng voucher 🎁</Link>
      )}
    </div>
  );
}

export function OrderTrackingActions() {
  const { user, isHydrated } = useAuthContext();

  if (!isHydrated) return null;

  return (
    <div className="actions-row">
      {user ? (
        <Link href="/orders" className="btn-primary">Theo dõi ngay</Link>
      ) : (
        <Link href="/login" className="btn-primary">Đăng nhập để theo dõi</Link>
      )}
    </div>
  );
}
