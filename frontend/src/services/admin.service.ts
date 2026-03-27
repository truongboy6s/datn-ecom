import { apiRequest } from "@/services/api-client";
import type { Category, Discount, Order, Product } from "@/types/domain";

export interface DashboardMetrics {
  revenueToday: number;
  revenueYesterday: number;
  totalOrders: number;
  ordersToday: number;
  ordersYesterday: number;
  totalUsers: number;
  usersToday: number;
  usersYesterday: number;
  topProduct?: string;
}

export interface AdminCategory extends Category {
  productCount?: number;
}

export const adminService = {
  async getMetrics(token?: string) {
    const res = await apiRequest<{ data: DashboardMetrics }>("/admin/metrics", { token });
    return res.data ?? {
      revenueToday: 0,
      revenueYesterday: 0,
      totalOrders: 0,
      ordersToday: 0,
      ordersYesterday: 0,
      totalUsers: 0,
      usersToday: 0,
      usersYesterday: 0,
      topProduct: ""
    };
  },

  async listProducts(token?: string) {
    const res = await apiRequest<{ data: { docs: Product[] } }>("/admin/products?page=1&limit=100", { token });
    return res.data;
  },

  async createProduct(payload: {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
    categoryId: string;
  }, token?: string) {
    const res = await apiRequest<{ data: Product }>("/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      token,
    });
    return res.data;
  },

  async updateProduct(productId: string, payload: Partial<{ name: string; description: string; price: number; stock: number; imageUrl?: string; categoryId?: string }>, token?: string) {
    const res = await apiRequest<{ data: Product }>(`/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      token,
    });
    return res.data;
  },

  async deleteProduct(productId: string, token?: string) {
    const res = await apiRequest<{ data: Product }>(`/admin/products/${productId}`, {
      method: "DELETE",
      token,
    });
    return res.data;
  },

  async listOrders(token?: string) {
    const res = await apiRequest<{ data: Order[] }>("/admin/orders", { token });
    return res.data ?? [];
  },

  async listCategories(token?: string) {
    const res = await apiRequest<{ data: AdminCategory[] }>("/admin/categories", { token });
    return res.data ?? [];
  },

  async createCategory(payload: { name: string; slug: string; description?: string | null }, token?: string) {
    const res = await apiRequest<{ data: AdminCategory }>("/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      token,
    });
    return res.data;
  },

  async updateCategory(categoryId: string, payload: Partial<{ name: string; slug: string; description?: string | null }>, token?: string) {
    const res = await apiRequest<{ data: AdminCategory }>(`/admin/categories/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      token,
    });
    return res.data;
  },

  async deleteCategory(categoryId: string, token?: string) {
    const res = await apiRequest<{ data: AdminCategory }>(`/admin/categories/${categoryId}`, {
      method: "DELETE",
      token,
    });
    return res.data;
  },

  async listDiscounts(token?: string) {
    const res = await apiRequest<{ data: Discount[] }>("/admin/discounts", { token });
    return res.data ?? [];
  },

  async createDiscount(payload: {
    code: string;
    description?: string | null;
    discount: number;
    discountType: Discount["discountType"];
    maxUses?: number | null;
    expiresAt?: string | null;
    isActive?: boolean;
  }, token?: string) {
    const res = await apiRequest<{ data: Discount }>("/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      token,
    });
    return res.data;
  },

  async updateDiscount(discountId: string, payload: Partial<{
    description?: string | null;
    discount: number;
    discountType: Discount["discountType"];
    maxUses?: number | null;
    expiresAt?: string | null;
    isActive?: boolean;
  }>, token?: string) {
    const res = await apiRequest<{ data: Discount }>(`/admin/discounts/${discountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      token,
    });
    return res.data;
  },

  async deleteDiscount(discountId: string, token?: string) {
    const res = await apiRequest<{ data: Discount }>(`/admin/discounts/${discountId}`, {
      method: "DELETE",
      token,
    });
    return res.data;
  },

  async updateOrder(orderId: string, payload: Partial<{ status: Order["status"]; paymentStatus: Order["paymentStatus"] }>, token?: string) {
    const res = await apiRequest<{ data: Order }>(`/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      token,
    });
    return res.data;
  },

  async confirmOrder(orderId: string, token?: string) {
    const res = await apiRequest<{ data: Order }>(`/admin/orders/${orderId}/confirm`, {
      method: "POST",
      token,
    });
    return res.data;
  },

  async shipOrder(orderId: string, token?: string) {
    const res = await apiRequest<{ data: Order }>(`/admin/orders/${orderId}/ship`, {
      method: "POST",
      token,
    });
    return res.data;
  },

  async cancelOrder(orderId: string, token?: string) {
    const res = await apiRequest<{ data: Order }>(`/admin/orders/${orderId}/cancel`, {
      method: "POST",
      token,
    });
    return res.data;
  },

  async refundOrder(orderId: string, token?: string) {
    const res = await apiRequest<{ data: Order }>(`/admin/orders/${orderId}/refund`, {
      method: "POST",
      token,
    });
    return res.data;
  },

  async listUsers(token?: string) {
    const res = await apiRequest<{ data: Array<{ id: string; name: string; email: string; role: string; createdAt: string }> }>(
      "/admin/users",
      { token }
    );
    return res.data ?? [];
  },

  async updateUserRole(userId: string, role: "USER" | "ADMIN", token?: string) {
    const res = await apiRequest<{ data: { id: string; name: string; email: string; role: string; createdAt: string } }>(
      `/admin/users/${userId}/role`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        token,
      }
    );
    return res.data;
  },

  async deleteUser(userId: string, token?: string) {
    const res = await apiRequest<{ data: { id: string; name: string; email: string; role: string; createdAt: string } }>(
      `/admin/users/${userId}`,
      {
        method: "DELETE",
        token,
      }
    );
    return res.data;
  }
};
