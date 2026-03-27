"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import { productService, SearchResult } from "@/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/domain";

type SortOption = "relevance" | "price-asc" | "price-desc" | "newest" | "best-selling";

function highlightText(text: string, keyword: string) {
  if (!keyword.trim()) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cart = useCart();

  const query = searchParams.get("q") || "";
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [page, setPage] = useState(1);
  const [cartError, setCartError] = useState<string | null>(null);

  // Fetch search results
  useEffect(() => {
    if (!query.trim()) {
      setSearchResult(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const sortMapping: Record<SortOption, { sortBy: string; sortOrder: string }> = {
      relevance: { sortBy: "relevance", sortOrder: "desc" },
      "price-asc": { sortBy: "price", sortOrder: "asc" },
      "price-desc": { sortBy: "price", sortOrder: "desc" },
      newest: { sortBy: "newest", sortOrder: "desc" },
      "best-selling": { sortBy: "best-selling", sortOrder: "desc" },
    };

    const sort = sortMapping[sortBy];

    productService
      .search({
        q: query,
        page,
        limit: 20,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      })
      .then((result) => {
        setSearchResult(result);
      })
      .catch(() => {
        setSearchResult(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [query, sortBy, page]);

  const totalPages = searchResult?.meta?.totalPages || 0;

  if (!query.trim()) {
    return (
      <main className="container page">
        <h1>Tìm kiếm sản phẩm</h1>
        <p className="page-subtitle" style={{ textAlign: "center", padding: "60px 0" }}>
          Nhập từ khóa để tìm kiếm sản phẩm
        </p>
      </main>
    );
  }

  return (
    <main className="container page">
      <h1>
        Kết quả tìm kiếm cho &ldquo;{query}&rdquo;
      </h1>

      {isLoading ? (
        <div className="search-page__loading">
          <div className="search-dropdown__spinner" style={{ width: 32, height: 32 }} />
          <p>Đang tìm kiếm...</p>
        </div>
      ) : (
        <>
          {searchResult && searchResult.docs.length > 0 ? (
            <>
              <p className="page-subtitle">
                Tìm thấy {searchResult.meta.total} sản phẩm
              </p>

              {/* Sort toolbar */}
              <div className="table-toolbar" style={{ marginBottom: 20 }}>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setPage(1);
                  }}
                >
                  <option value="relevance">Sắp xếp: Liên quan nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="newest">Mới nhất</option>
                  <option value="best-selling">Bán chạy</option>
                </select>
              </div>

              {cartError && <p style={{ color: "#ef4444" }}>{cartError}</p>}

              {/* Product grid */}
              <section className="product-grid">
                {searchResult.docs.map((product) => (
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
                        setCartError("Không thể kiểm tra tồn kho.");
                      }
                    }}
                  />
                ))}
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="search-pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn-outline btn-sm"
                  >
                    ← Trước
                  </button>
                  <span className="search-pagination__info">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-outline btn-sm"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          ) : (
            /* No results */
            <div className="search-page__empty">
              <div className="search-page__empty-icon">🔍</div>
              <h2>Không tìm thấy sản phẩm</h2>
              <p>
                Không có kết quả phù hợp với &ldquo;{query}&rdquo;.
                <br />
                Hãy thử từ khóa khác hoặc kiểm tra chính tả.
              </p>

              {searchResult?.suggestions && searchResult.suggestions.length > 0 && (
                <div className="search-page__suggestions">
                  <h3>💡 Có thể bạn muốn tìm</h3>
                  <div className="product-grid">
                    {searchResult.suggestions.map((item) => (
                      <article
                        key={item.id}
                        className="product-card"
                        onClick={() => router.push(`/products/${item.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="product-card__link">
                          <div className="product-card__thumb">
                            <img
                              src={
                                item.imageUrl ||
                                "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80"
                              }
                              alt={item.name}
                            />
                          </div>
                          <div className="product-card__content">
                            <h3>{item.name}</h3>
                          </div>
                        </div>
                        <div className="product-card__bottom">
                          <strong>{item.price.toLocaleString("vi-VN")} ₫</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="container page">
          <h1>Tìm kiếm sản phẩm</h1>
          <div className="search-page__loading">
            <div className="search-dropdown__spinner" style={{ width: 32, height: 32 }} />
            <p>Đang tải...</p>
          </div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
