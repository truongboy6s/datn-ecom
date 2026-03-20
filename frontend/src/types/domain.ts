export type UserRole = "USER" | "ADMIN";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: Category;
  reviewCount?: number;
  averageRating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items?: OrderItem[];
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export const ORDER_STATUS_VIETNAMESE: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Đang chờ",
  [OrderStatus.PROCESSING]: "Đang xử lý",
  [OrderStatus.COMPLETED]: "Hoàn thành",
  [OrderStatus.CANCELLED]: "Đã hủy",
};

export const PAYMENT_STATUS_VIETNAMESE: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Chờ thanh toán",
  [PaymentStatus.PAID]: "Đã thanh toán",
  [PaymentStatus.FAILED]: "Thất bại",
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AppUser;
}

export interface ChatMessage {
  id?: string;
  role: "USER" | "ASSISTANT";
  message: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  user: { id: string; name: string };
  createdAt: string;
}

export type DiscountType = "percentage" | "fixed";

export interface Discount {
  id: string;
  code: string;
  description?: string | null;
  discount: number;
  discountType: DiscountType;
  maxUses?: number | null;
  usesCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt?: string;
}
