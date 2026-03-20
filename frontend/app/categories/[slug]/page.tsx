import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { apiServer } from "@/lib/api";
import type { Product } from "@/types/domain";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function fetchProducts() {
  const res = await apiServer("/products?page=1&limit=100");
  return (res.data?.docs || []) as Product[];
}

export default async function CategoryProductsPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const products = await fetchProducts();
  const categories = new Map<string, { id: string; name: string; slug: string }>();

  for (const product of products) {
    if (product.category?.id && product.category?.name) {
      const name = product.category.name;
      const categorySlug = slugify(name);
      if (!categories.has(product.category.id)) {
        categories.set(product.category.id, { id: product.category.id, name, slug: categorySlug });
      }
    }
  }

  const category = Array.from(categories.values()).find((item) => item.slug === slug);
  const visibleProducts = category
    ? products.filter((product) => product.category?.id === category.id)
    : [];

  return (
    <main className="container page">
      <p className="page-subtitle">
        <Link href="/">Trang chủ</Link>{" / "}
        <Link href="/products">Sản phẩm</Link>{" / "}
        <span style={{ color: "var(--text)" }}>{category?.name ?? "Danh mục"}</span>
      </p>

      <h1>📂 Danh mục: {category?.name ?? "Không xác định"}</h1>
      <p className="note-text" style={{ marginBottom: 20 }}>
        Có {visibleProducts.length} sản phẩm trong danh mục này.
      </p>

      {/* Category navigation */}
      {categories.size > 0 ? (
        <section className="category-strip" style={{ marginBottom: 20 }}>
          {Array.from(categories.values()).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={cat.slug === slug ? "category-chip category-chip--active" : "category-chip"}
            >
              {cat.name}
            </Link>
          ))}
        </section>
      ) : null}

      <section className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {visibleProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: 10 }}>📦</p>
          <h2>Chưa có sản phẩm</h2>
          <p>Danh mục này hiện chưa có sản phẩm. Hãy quay lại sau!</p>
          <Link href="/products" className="btn-primary" style={{ display: "inline-block", marginTop: 14 }}>
            Xem tất cả sản phẩm
          </Link>
        </div>
      ) : null}
    </main>
  );
}
