"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/types/domain";

const CART_STORAGE_KEY = "datn_ecom_cart";
const CART_UPDATE_EVENT = "datn_cart_updated";

export function showToast(message: string, isError = false) {
  if (typeof document === "undefined") return;
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${isError ? "var(--danger)" : "var(--brand)"}; 
    color: white; padding: 14px 24px; border-radius: 8px; font-size: .95rem;
    box-shadow: 0 6px 16px rgba(0,0,0,0.15); font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateY(100px); opacity: 0;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  });
  setTimeout(() => {
    toast.style.transform = "translateY(100px)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const addToCart = (product: Product, quantity = 1) => {
    const available = typeof product.stock === "number" ? product.stock : Infinity;
    if (available <= 0 || quantity <= 0) return;
    setItems((prev) => {
      const index = prev.findIndex((item) => item.product.id === product.id);
      if (index === -1) {
        return [...prev, { product, quantity: Math.min(quantity, available) }];
      }

      const next = [...prev];
      const currentQty = next[index].quantity;
      next[index] = {
        ...next[index],
        product,
        quantity: Math.min(currentQty + quantity, available),
      };
      return next;
    });
    showToast(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const decreaseQuantity = (productId: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.product.id === productId);
      if (index === -1) return prev;
      const next = [...prev];
      const current = next[index];
      if (current.quantity <= 1) {
        return next.filter((item) => item.product.id !== productId);
      }
      next[index] = { ...current, quantity: current.quantity - 1 };
      return next;
    });
  };

  const clearCart = () => setItems([]);

  // Initial hydration and sync across tabs/components
  useEffect(() => {
    const loadCart = () => {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        setItems([]);
        setIsHydrated(true);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        setItems(parsed.filter((item) => uuidRegex.test(item.product?.id || "")));
      } catch {
        setItems([]);
      }
      setIsHydrated(true);
    };

    loadCart();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) loadCart();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CART_UPDATE_EVENT, loadCart);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CART_UPDATE_EVENT, loadCart);
    };
  }, []);

  // Save to localStorage when state changes and notify other components
  useEffect(() => {
    if (!isHydrated) return;
    const currentRaw = window.localStorage.getItem(CART_STORAGE_KEY);
    const newRaw = JSON.stringify(items);
    if (currentRaw !== newRaw) {
      window.localStorage.setItem(CART_STORAGE_KEY, newRaw);
      window.dispatchEvent(new Event(CART_UPDATE_EVENT));
    }
  }, [items, isHydrated]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items]
  );

  return {
    items,
    total,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    isHydrated
  };
}
