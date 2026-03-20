"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/hooks/useCart";
import type { Product, Review } from "@/types/domain";
import { reviewService } from "@/services/review.service";
import { useAuthContext } from "@/context/AuthContext";
import { productService } from "@/services/product.service";

type TabKey = "description" | "reviews" | "policy";

interface ProductDetailClientProps {
  product: Product;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const cart = useCart();
  const { user, isHydrated } = useAuthContext();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  const categorySlug = product.category?.name ? slugify(product.category.name) : undefined;

  const relatedProducts: Product[] = [];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [currentStock, setCurrentStock] = useState(product.stock);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    reviewService
      .listByProduct(product.id)
      .then((res) => {
        if (!active) return;
        setReviews(res);
      })
      .catch(() => {
        if (!active) return;
        setReviews([]);
      });

    if (isHydrated && user) {
      reviewService
        .checkEligibility(product.id)
        .then((res) => {
          if (!active) return;
          setCanReview(res.canReview);
        })
        .catch(() => {
          if (!active) return;
          setCanReview(false);
        });
    } else {
      setCanReview(false);
    }

    return () => {
      active = false;
    };
  }, [product.id, isHydrated, user]);

  const handleAddToCart = async () => {
    setCartError(null);
    try {
      const latest = await productService.getById(product.id);
      setCurrentStock(latest.stock);
      if (latest.stock <= 0) {
        setCartError("Sản phẩm đã hết hàng.");
        return;
      }
      if (qty > latest.stock) {
        setQty(latest.stock);
        setCartError("Số lượng vượt tồn kho hiện có.");
        return;
      }
      cart.addToCart({ ...product, stock: latest.stock }, qty);
    } catch {
      setCartError("Không thể kiểm tra tồn kho. Vui lòng thử lại.");
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Mô tả" },
    { key: "reviews", label: `Đánh giá (${reviews.length})` },
    { key: "policy", label: "Chính sách" }
  ];

  return (
    <main className="container page">
      {/* Breadcrumb */}
      <p className="page-subtitle">
        <Link href="/">Trang chủ</Link>
        {" / "}
        <Link href="/products">Sản phẩm</Link>
        {product.category?.name && categorySlug ? (
          <>
            {" / "}
            <Link href={`/categories/${categorySlug}`}>{product.category?.name}</Link>
          </>
        ) : null}
        {" / "}
        <span style={{ color: "var(--text)" }}>{product.name}</span>
      </p>

      {/* Product Detail */}
      <section className="product-detail">
        <div className="product-detail__image-wrap">
          <img
            src={
              product.imageUrl ||
              "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80"
            }
            alt={product.name}
            className="product-detail__image"
          />
        </div>

        <div className="product-detail__info">
          {product.category?.name ? (
            <span className="product-detail__category">{product.category.name}</span>
          ) : null}
          <h1>{product.name}</h1>

          <div className="product-card__rating" style={{ padding: 0, marginBottom: 12 }}>
            {"★★★★★".split("").map((_, i) => (
              <span
                key={i}
                style={{ color: i < Math.round(product.averageRating ?? 0) ? "#f59e0b" : "#d1d5db" }}
              >
                {i < Math.round(product.averageRating ?? 0) ? "★" : "☆"}
              </span>
            ))}
            <span className="count">
              {(product.averageRating ?? 0).toFixed(1)} ({product.reviewCount ?? reviews.length} đánh giá)
            </span>
          </div>

          <p className="product-detail__price">{product.price.toLocaleString("vi-VN")}₫</p>

          <p className={`product-detail__stock ${currentStock <= 0 ? "out-of-stock" : ""}`}>
            {currentStock > 0 ? `✓ Còn hàng (${currentStock} sản phẩm)` : "✕ Hết hàng"}
          </p>
          {cartError ? <p style={{ color: "#ef4444", marginBottom: 12 }}>{cartError}</p> : null}

          <p style={{ color: "var(--muted)", marginBottom: 16 }}>{product.description}</p>

          {/* Quantity selector */}
          <div className="qty-selector">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(Math.min(currentStock, qty + 1))}>+</button>
          </div>

          <div className="actions-row">
            <button className="btn-primary" onClick={handleAddToCart} disabled={currentStock <= 0}>
              🛒 Thêm vào giỏ
            </button>
            <Link href="/products" className="btn-outline">
              ← Quay lại
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "description" ? (
          <div>
            <h3>Chi tiết sản phẩm</h3>
            <p>{product.description}</p>
            <ul style={{ paddingLeft: 20, color: "var(--muted)", lineHeight: 2 }}>
              <li>Bảo hành chính hãng 24 tháng</li>
              <li>Đổi trả miễn phí trong 30 ngày</li>
              <li>Giao hàng nhanh 2H nội thành</li>
              <li>Hỗ trợ trả góp 0% qua thẻ tín dụng</li>
            </ul>
          </div>
        ) : null}

        {activeTab === "reviews" ? (
          <div style={{ display: "grid", gap: 14 }}>
            {canReview ? (
              <div style={{
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "14px",
              }}>
                <h4 style={{ margin: "0 0 8px" }}>Đánh giá sản phẩm</h4>
                {reviewError ? <p style={{ color: "#ef4444" }}>{reviewError}</p> : null}
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <label style={{ fontSize: ".9rem" }}>
                    Số sao
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      style={{ marginLeft: 8 }}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <textarea
                  placeholder="Chia sẻ trải nghiệm của bạn"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
                <button
                  className="btn-primary"
                  style={{ marginTop: 8 }}
                  onClick={async () => {
                    setReviewSubmitting(true);
                    setReviewError(null);
                    try {
                      const created = await reviewService.create({
                        productId: product.id,
                        rating: reviewRating,
                        comment: reviewComment || null,
                      });
                      setReviews((prev) => [created, ...prev]);
                      setCanReview(false);
                      setReviewComment("");
                      setReviewRating(5);
                    } catch (err: any) {
                      let message = err.message || "Lỗi gửi đánh giá.";
                      try {
                        const parsed = JSON.parse(err.message);
                        if (parsed?.message) message = parsed.message;
                      } catch {
                        // ignore
                      }
                      setReviewError(message);
                    } finally {
                      setReviewSubmitting(false);
                    }
                  }}
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            ) : null}

            {reviews.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có đánh giá nào.</p>
            ) : null}
            {reviews.map((review) => (
              <div key={review.id} style={{
                background: "#fff", border: "1px solid var(--line)",
                borderRadius: "var(--radius)", padding: "14px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="user-avatar">{review.user.name.charAt(0)}</span>
                    <strong style={{ fontSize: ".9rem" }}>{review.user.name}</strong>
                  </div>
                  <span style={{ color: "#f59e0b" }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment ? (
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: ".88rem" }}>{review.comment}</p>
                ) : null}
                <p style={{ margin: "6px 0 0", fontSize: ".78rem", color: "var(--muted)" }}>
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "policy" ? (
          <div>
            <h3>Chính sách mua hàng</h3>
            <ul style={{ paddingLeft: 20, color: "var(--muted)", lineHeight: 2 }}>
              <li>✅ Cam kết hàng chính hãng 100%</li>
              <li>🔄 Đổi trả miễn phí trong 30 ngày nếu lỗi nhà sản xuất</li>
              <li>🚚 Giao hàng toàn quốc, freeship đơn từ 499.000₫</li>
              <li>💳 Thanh toán: COD, MoMo, VNPay</li>
              <li>🔒 Bảo mật thông tin thanh toán tuyệt đối</li>
            </ul>
          </div>
        ) : null}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 ? (
        <section className="related-section">
          <div className="section-block__header">
            <h2>Sản phẩm liên quan</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
