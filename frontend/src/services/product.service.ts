import { apiClient } from "@/lib/api";
import type { Product } from "@/types/domain";

export interface SearchResult {
  docs: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    query: string;
  };
  suggestions?: { id: string; name: string; imageUrl: string | null; price: number }[];
}

export interface AutocompleteItem {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

export const productService = {
  async list(page: number, limit: number) {
    const res = await apiClient(`/products?page=${page}&limit=${limit}`);
    return res.data as { docs: Product[] };
  },

  async getById(productId: string) {
    const res = await apiClient(`/products/${productId}`);
    return res.data as Product;
  },

  async search(params: {
    q: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const searchParams = new URLSearchParams();
    searchParams.set("q", params.q);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));

    const res = await apiClient(`/products/search?${searchParams.toString()}`);
    return res.data as SearchResult;
  },

  async autocomplete(query: string, signal?: AbortSignal) {
    const res = await apiClient(`/products/autocomplete?q=${encodeURIComponent(query)}`, { signal });
    return res.data as AutocompleteItem[];
  },
};
