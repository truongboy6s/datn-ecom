"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/types/domain";

const CART_STORAGE_KEY = "datn_ecom_cart";

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

  useEffect(() => {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const filtered = parsed.filter((item) => uuidRegex.test(item.product?.id || ""));
      setItems(filtered);
    } catch {
      setItems([]);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
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
