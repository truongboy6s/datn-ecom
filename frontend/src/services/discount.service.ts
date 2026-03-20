import { apiClient } from "@/lib/api";
import type { Discount } from "@/types/domain";

export const discountService = {
  async listActive() {
    const res = await apiClient("/discounts");
    return (res.data || []) as Discount[];
  }
};
