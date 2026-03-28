import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { apiServer } from "@/lib/api";
import { HeroAuthActions, OrderTrackingActions } from "@/components/home/AuthDependentLinks";
import type { Product } from "@/types/domain";

export const revalidate = 60;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  let categoryLinks: Array<{ id: string; name: string; slug: string }> = [];
  try {
    const res = await apiServer("/products?page=1&limit=100");
    const products = (res.data?.docs || []) as Product[];
    featuredProducts = products.slice(0, 4);
    const map = new Map<string, { id: string; name: string; slug: string }>();
    for (const product of products) {
      if (product.category?.id && product.category?.name) {
        const name = product.category.name;
        if (!map.has(product.category.id)) {
          map.set(product.category.id, {
            id: product.category.id,
            name,
            slug: slugify(name),
          });
        }
      }
    }
    categoryLinks = Array.from(map.values());
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Could not fetch featured products", err);
    }
    featuredProducts = [];
    categoryLinks = [];
  }

  return (
    <main className="container page">
      {/* ── Hero ────────────────────────────────────────── */}
      <section 
        className="hero-banner" 
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.95) 40%, rgba(255, 255, 255, 0.2)), url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          color: "var(--text)"
        }}
      >
        <div>
          <p className="hero-tag">⚡ FLASH SALE 3.3</p>
          <h1 style={{ fontSize: "2.4rem", textShadow: "0 2px 10px rgba(255,255,255,0.8)" }}>Siêu sale đồ điện tử,<br />ưu đãi đến 50%</h1>
          <p style={{ fontWeight: 500, fontSize: "1.05rem" }}>
            Mua sắm thông minh, giá tốt, giao siêu tốc 2H.<br/> Trải nghiệm AI chatbot gợi ý sản phẩm ngay hôm nay.
          </p>
          <HeroAuthActions />
        </div>
        <div className="hero-card" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
          <h3>🔥 Deal trong ngày</h3>
          <p style={{ fontWeight: 600 }}>💻 Laptop gaming từ 18.990.000₫</p>
          <p style={{ fontWeight: 600 }}>🎧 Tai nghe Bluetooth giảm 35%</p>
          <p style={{ fontWeight: 600 }}>⌨️ Combo office tiết kiệm tối đa</p>
          <p style={{ marginTop: 10, fontSize: ".82rem", color: "var(--muted)" }}>
            Áp dụng đến 23:59 hôm nay
          </p>
        </div>
      </section>

      {/* ── Category Strip ──────────────────────────────── */}
      {categoryLinks.length > 0 ? (
        <section className="category-strip">
          {categoryLinks.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="category-link">
              {cat.name}
            </Link>
          ))}
        </section>
      ) : null}

      {/* ── Entry Grid ──────────────────────────────────── */}
      <section className="entry-grid">
        <article className="entry-card">
          <h2>📦 Danh mục nổi bật</h2>
          <p>Khám phá bộ sưu tập sản phẩm bán chạy nhất tuần này.</p>
          <div className="actions-row">
            <Link href="/products" className="btn-primary">Xem tất cả</Link>
            <Link href="/cart" className="btn-outline">Đến giỏ hàng</Link>
          </div>
        </article>
        <article className="entry-card">
          <h2>🚚 Đơn hàng của bạn</h2>
          <p>Theo dõi trạng thái thanh toán và vận chuyển theo thời gian thực.</p>
          <OrderTrackingActions />
        </article>
      </section>

      {/* ── Promo ───────────────────────────────────────── */}
      <section className="promo-grid">
        <article style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop')",
          backgroundSize: "cover", backgroundPosition: "center"
        }}>
          <div className="promo-icon">🎟️</div>
          <h3>Voucher 200K cho user mới</h3>
          <p>Đăng ký tài khoản để nhận mã giảm giá và flash sale ưu đãi riêng.</p>
        </article>
        <article style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop')",
          backgroundSize: "cover", backgroundPosition: "center"
        }}>
          <div className="promo-icon">🚀</div>
          <h3>Freeship toàn quốc</h3>
          <p>Áp dụng cho mọi đơn hàng từ 499.000₫ cập bến tận nhà miễn phí.</p>
        </article>
        <article style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop')",
          backgroundSize: "cover", backgroundPosition: "center"
        }}>
          <div className="promo-icon">💳</div>
          <h3>Thanh toán tiện lợi</h3>
          <p>Hỗ trợ thanh toán qua thẻ tín dụng và đối tác thanh toán liên kết nhanh gọn.</p>
        </article>
      </section>

      {/* ── Featured Products ───────────────────────────── */}
      <section className="section-block">
        <div className="section-block__header">
          <h2>🌟 Sản phẩm đề xuất</h2>
          <Link href="/products">Xem thêm →</Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {featuredProducts.length === 0 ? (
          <p className="page-subtitle" style={{ marginTop: 12 }}>
            Chưa có sản phẩm để hiển thị.
          </p>
        ) : null}
      </section>
    </main>
  );
}
