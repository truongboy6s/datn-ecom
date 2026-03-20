"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/domain";
import { productService } from "@/services/product.service";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

interface ProductsClientProps {
  initialProducts: Product[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [products] = useState<Product[]>(initialProducts);

  const cart = useCart();
  const [cartError, setCartError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    for (const product of products) {
      if (product.category?.id && product.category?.name) {
        const name = product.category.name;
        const slug = name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        if (!map.has(product.category.id)) {
          map.set(product.category.id, { id: product.category.id, name, slug });
        }
      }
    }
    return Array.from(map.values());
  }, [products]);

  let visibleProducts: Product[] =
    activeCategory === "all"
      ? [...products]
      : products.filter((p) => p.category?.id === activeCategory);

  if (sortBy === "price-asc") visibleProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") visibleProducts.sort((a, b) => b.price - a.price);
  else if (sortBy === "name") visibleProducts.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="container page">
      <h1>Danh sách sản phẩm</h1>
      <p className="page-subtitle">
        {visibleProducts.length} sản phẩm · Tổng tạm tính: {cart.total.toLocaleString("vi-VN")}₫
      </p>
      {cartError ? <p style={{ color: "#ef4444" }}>{cartError}</p> : null}

      {/* Toolbar */}
      <div className="table-toolbar">
        <section className="category-strip" style={{ margin: 0 }}>
          <button
            className={activeCategory === "all" ? "category-chip category-chip--active" : "category-chip"}
            onClick={() => setActiveCategory("all")}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={activeCategory === cat.id ? "category-chip category-chip--active" : "category-chip"}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </section>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
          <option value="name">Tên: A → Z</option>
        </select>
      </div>

      {/* Category links */}
      <section className="category-links">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            {cat.name}
          </Link>
        ))}
      </section>

      {/* Product grid */}
      <section className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={async (item) => {
              setCartError(null);
              try {
                const latest = await productService.getById(item.id);
                if (latest.stock <= 0) {
                  setCartError("Sản phẩm đã hết hàng.");
                  return;
                }
                cart.addToCart({ ...item, stock: latest.stock });
              } catch {
                setCartError("Không thể kiểm tra tồn kho. Vui lòng thử lại.");
              }
            }}
          />
        ))}
      </section>

      {visibleProducts.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
          Không tìm thấy sản phẩm nào trong danh mục này.
        </p>
      ) : null}
    </main>
  );
}
