"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, total, removeFromCart, clearCart, addToCart, decreaseQuantity, isHydrated } = useCart();

  return (
    <main className="container page">
      <h1>🛒 Giỏ hàng</h1>
      <p className="page-subtitle">{items.length} sản phẩm trong giỏ</p>

      {!isHydrated ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "var(--muted)" }}>Đang tải giỏ hàng...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "3rem", marginBottom: 12 }}>🛒</p>
          <h2>Giỏ hàng đang trống</h2>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm.</p>
          <Link href="/products" className="btn-primary" style={{ display: "inline-block" }}>
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <img
                  className="cart-item__thumb"
                  src={
                    item.product.imageUrl ||
                    "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={item.product.name}
                />
                <div className="cart-item__info">
                  <h3>{item.product.name}</h3>
                  <p>{item.product.category?.name}</p>
                  <div className="qty-selector" style={{ marginTop: 8, marginBottom: 0 }}>
                    <button onClick={() => decreaseQuantity(item.product.id)}>−</button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product)}
                      disabled={typeof item.product.stock === "number" && item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch", padding: "4px 0" }}>
                  <p className="cart-item__price" style={{ margin: 0 }}>
                    {(item.product.price * item.quantity).toLocaleString("vi-VN")}₫
                  </p>
                  <button
                    className="btn-sm"
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ color: "var(--danger)", borderColor: "var(--danger-bg)" }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <span>{total.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="cart-summary-row">
              <span>Phí vận chuyển</span>
              <span style={{ color: "var(--success)" }}>Miễn phí</span>
            </div>
            <div className="cart-summary-row">
              <span>Giảm giá</span>
              <span>0₫</span>
            </div>
            <div className="cart-summary-total">
              <span>Tổng cộng</span>
              <span style={{ color: "var(--brand-dark)" }}>{total.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="actions-row" style={{ marginTop: 16 }}>
              <Link
                href="/checkout"
                className="btn-primary"
                style={{ width: "100%", textAlign: "center", display: "block" }}
              >
                Thanh toán →
              </Link>
            </div>
            <button
              onClick={clearCart}
              className="btn-outline btn-sm"
              style={{ width: "100%", marginTop: 8 }}
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
