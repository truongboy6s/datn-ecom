import { apiClient } from "@/lib/api";
import type { Review } from "@/types/domain";

export const reviewService = {
  async listByProduct(productId: string) {
    const res = await apiClient(`/reviews?productId=${productId}`);
    return (res.data || []) as Review[];
  },

  async checkEligibility(productId: string) {
    const res = await apiClient(`/reviews/eligibility?productId=${productId}`);
    return res.data as { canReview: boolean; reason: string };
  },

  async create(payload: { productId: string; rating: number; comment?: string | null }) {
    const res = await apiClient("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data as Review;
  }
};
