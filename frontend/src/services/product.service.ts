import { apiClient } from "@/lib/api";
import type { Product } from "@/types/domain";

export const productService = {
  async list(page: number, limit: number) {
    const res = await apiClient(`/products?page=${page}&limit=${limit}`);
    return res.data as { docs: Product[] };
  },

  async getById(productId: string) {
    const res = await apiClient(`/products/${productId}`);
    return res.data as Product;
  }
};
