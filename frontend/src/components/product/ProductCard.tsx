"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, showToast } from "@/hooks/useCart";
import { useAuthContext } from "@/context/AuthContext";
import type { Product } from "@/types/domain";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const STAR = "★";
const STAR_EMPTY = "☆";

function renderStars(rating: number) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "star" : ""} style={{ color: i < rating ? "#f59e0b" : "#d1d5db" }}>
          {i < rating ? STAR : STAR_EMPTY}
        </span>
      ))}
    </span>
  );
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isHot = product.stock <= 10;
  const ratingValue = Math.max(0, Math.min(5, product.averageRating ?? 0));
  const reviewCount = product.reviewCount ?? 0;

  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuthContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail if button is clicked
    if (!user) {
      showToast("Vui lòng đăng nhập để mua hàng", true);
      router.push("/login");
      return;
    }
    
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      router.push(`/checkout?buyNow=${product.id}:1`);
    }
  };

  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__thumb" aria-hidden>
          <img
            src={
              product.imageUrl ||
              "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80"
            }
            alt={product.name}
          />
          <span>{product.category?.name ?? "Sản phẩm"}</span>
          {isHot ? <span className="product-card__badge-hot">HOT</span> : null}
        </div>
        <div className="product-card__content">
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      </Link>
      <div className="product-card__rating">
        {renderStars(ratingValue)}
        <span className="count">{ratingValue.toFixed(1)} ({reviewCount})</span>
      </div>
      <p style={{ margin: "4px 16px 0", fontSize: ".78rem", color: "var(--muted)" }}>
        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
      </p>
      <div className="product-card__bottom">
        <strong>{product.price.toLocaleString("vi-VN")} ₫</strong>
        <button onClick={handleAddToCart} disabled={product.stock <= 0} className="btn-sm">
          {product.stock > 0 ? "🛒 Mua ngay" : "Hết hàng"}
        </button>
      </div>
    </article>
  );
}
