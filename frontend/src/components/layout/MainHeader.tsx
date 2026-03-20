"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { useCart } from "@/hooks/useCart";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const userNav = [
  {
    href: "/",
    label: "Trang chủ",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    href: "/products",
    label: "Sản phẩm",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    )
  },
  {
    href: "/cart",
    label: "Giỏ hàng",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    showBadge: true
  },
  {
    href: "/orders",
    label: "Đơn hàng",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  }
];

export function MainHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();
  const { user, logout, isHydrated } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push("/");
  };

  return (
    <header className="main-header">
      <div className="main-header__inner">
        <Logo />

        <div className="header-search">
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input placeholder="Tìm laptop, điện thoại, tai nghe..." />
        </div>

        <nav className="main-nav">
          {userNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={isActive ? { background: "var(--brand-soft)", borderColor: "#ffb993" } : undefined}
              >
                {item.icon}
                {item.label}
                {item.showBadge && isMounted && itemCount > 0 ? (
                  <span className="nav-cart-badge">{itemCount}</span>
                ) : null}
              </Link>
            );
          })}
          
          {isHydrated && user ? (
            // User menu when logged in
            <div className="user-menu-wrapper" style={{ position: "relative" }}>
              <button 
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: user.avatarUrl ? `url(${user.avatarUrl})` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  border: "2px solid var(--brand)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  overflow: "hidden",
                }}
                title={user.name}
              >
                {!user.avatarUrl && user.name.charAt(0).toUpperCase()}
              </button>

              {showUserMenu && (
                <div style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  minWidth: "220px",
                  zIndex: 1000,
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: ".95rem" }}>{user.name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: ".85rem", color: "var(--muted)" }}>{user.email}</p>
                  </div>
                  <Link 
                    href="/profile"
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      color: "var(--text)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--line)",
                      fontSize: ".9rem",
                    }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 Thông tin người dùng
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: ".9rem",
                      color: "#ef4444",
                      fontWeight: "500",
                    }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Auth links when not logged in
            <>
              <Link href="/login" className="main-nav__auth">
                Đăng nhập
              </Link>
              <Link href="/register" className="main-nav__auth main-nav__auth--primary">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
