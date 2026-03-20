import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { apiServer } from "@/lib/api";
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
      <section className="hero-banner">
        <div>
          <p className="hero-tag">⚡ FLASH SALE 3.3</p>
          <h1>Siêu sale đồ điện tử,<br />ưu đãi đến 50%</h1>
          <p>
            Mua sắm nhanh, giá tốt, giao nhanh 2H. AI chatbot gợi ý sản phẩm phù hợp nhu cầu.
          </p>
          <div className="actions-row">
            <Link href="/products" className="btn-primary">🛒 Mua ngay</Link>
            <Link href="/register" className="btn-outline">🎁 Nhận voucher mới</Link>
          </div>
        </div>
        <div className="hero-card">
          <h3>🔥 Deal trong ngày</h3>
          <p>Laptop gaming từ 18.990.000₫</p>
          <p>Tai nghe Bluetooth giảm 35%</p>
          <p>Combo office tiết kiệm tối đa</p>
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
          <div className="actions-row">
            <Link href="/orders" className="btn-primary">Theo dõi ngay</Link>
            <Link href="/login" className="btn-outline">Đăng nhập</Link>
          </div>
        </article>
      </section>

      {/* ── Promo ───────────────────────────────────────── */}
      <section className="promo-grid">
        <article>
          <div className="promo-icon">🎟️</div>
          <h3>Voucher 200K cho user mới</h3>
          <p>Đăng ký tài khoản để nhận mã giảm giá và flash sale riêng.</p>
        </article>
        <article>
          <div className="promo-icon">🚀</div>
          <h3>Freeship toàn quốc</h3>
          <p>Áp dụng cho đơn từ 499.000₫ trong hệ thống.</p>
        </article>
        <article>
          <div className="promo-icon">💳</div>
          <h3>Trả góp 0%</h3>
          <p>Hỗ trợ trả góp qua đối tác thanh toán liên kết.</p>
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
