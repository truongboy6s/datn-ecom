import { OrderStatus, PaymentStatus, type Product, type Order, type ChatMessage } from "@/types/domain";

/* ──────────────────────────────────────────────────── */
/*  Interfaces                                          */
/* ──────────────────────────────────────────────────── */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export interface PosterItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  imageUrl: string;
}

export interface AdminRevenuePoint {
  month: string;
  revenue: number;
}

export interface StatusShareItem {
  label: string;
  value: number;
  color: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface FlashDeal {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
}

export interface BrandItem {
  id: string;
  name: string;
}

export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AIInsightItem {
  id: string;
  type: string;
  title: string;
  description: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
}

/* ──────────────────────────────────────────────────── */
/*  Categories                                          */
/* ──────────────────────────────────────────────────── */
export const productCategories: ProductCategory[] = [
  { id: "c-1", name: "Laptop", slug: "laptop", productCount: 3 },
  { id: "c-2", name: "Điện thoại", slug: "dien-thoai", productCount: 1 },
  { id: "c-3", name: "Màn hình", slug: "man-hinh", productCount: 1 },
  { id: "c-4", name: "Phụ kiện", slug: "phu-kien", productCount: 2 },
  { id: "c-5", name: "Gaming Gear", slug: "gaming-gear", productCount: 1 },
  { id: "c-6", name: "Nhà thông minh", slug: "nha-thong-minh", productCount: 1 }
];

/* ──────────────────────────────────────────────────── */
/*  Posters                                             */
/* ──────────────────────────────────────────────────── */
export const homePosters: PosterItem[] = [
  {
    id: "poster-laptop",
    title: "Laptop Performance Week",
    subtitle: "Giảm đến 30% cho dòng gaming và creator",
    cta: "Khám phá ngay",
    imageUrl:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "poster-audio",
    title: "Audio Day",
    subtitle: "Tai nghe true wireless, loa bluetooth ưu đãi 24h",
    cta: "Săn deal",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "poster-office",
    title: "Setup Văn Phòng Tại Nhà",
    subtitle: "Combo màn hình + bàn phím + chuột tiết kiệm hơn",
    cta: "Xem combo",
    imageUrl:
      "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80"
  }
];

/* ──────────────────────────────────────────────────── */
/*  Products                                            */
/* ──────────────────────────────────────────────────── */
export const mockProducts: Product[] = [
  {
    id: "p-1",
    name: "Laptop Pro 14 2026",
    description: "Chip AI Core, RAM 16GB, SSD 1TB, pin 12 giờ. Thiết kế mỏng nhẹ, màn hình Retina sắc nét.",
    price: 25990000,
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-1", name: "Laptop" }
  },
  {
    id: "p-2",
    name: "Gaming Beast X",
    description: "RTX series, màn hình 165Hz, tản nhiệt kép. Hiệu năng đỉnh cao cho gaming và render.",
    price: 32990000,
    stock: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-1", name: "Laptop" }
  },
  {
    id: "p-3",
    name: "Phone Ultra S",
    description: "Camera 200MP, pin 5200mAh, sạc nhanh 120W. Trải nghiệm flagship đỉnh cao.",
    price: 18990000,
    stock: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-2", name: "Điện thoại" }
  },
  {
    id: "p-4",
    name: "Monitor Vision 27",
    description: "2K IPS, 144Hz, chuẩn màu cho thiết kế. Viền siêu mỏng, chân đế ergonomic.",
    price: 6990000,
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-3", name: "Màn hình" }
  },
  {
    id: "p-5",
    name: "Earbuds AirTune",
    description: "Chống ồn chủ động, pin 30 giờ, kết nối đa điểm. Âm thanh Hi-Res chuẩn studio.",
    price: 2490000,
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-4", name: "Phụ kiện" }
  },
  {
    id: "p-6",
    name: "Mechanical Keyboard K87",
    description: "Switch tactile, đèn RGB, hot-swap. Typing experience premium cho mọi nhu cầu.",
    price: 1690000,
    stock: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-5", name: "Gaming Gear" }
  },
  {
    id: "p-7",
    name: "Smart Home Hub",
    description: "Điều khiển thiết bị thông minh bằng giọng nói. Tương thích Google, Alexa, HomeKit.",
    price: 2990000,
    stock: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-6", name: "Nhà thông minh" }
  },
  {
    id: "p-8",
    name: "Power Bank 20.000mAh",
    description: "Sạc nhanh PD, 2 cổng USB-C, vỏ kim loại. Nhỏ gọn, tiện lợi mang theo mọi nơi.",
    price: 890000,
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    category: { id: "c-4", name: "Phụ kiện" }
  }
];

/* ──────────────────────────────────────────────────── */
/*  Flash Deals                                         */
/* ──────────────────────────────────────────────────── */
export const mockFlashDeals: FlashDeal[] = [
  { id: "fd-1", name: "Laptop Pro 14", originalPrice: 25990000, salePrice: 21990000, discount: 15 },
  { id: "fd-2", name: "Earbuds AirTune", originalPrice: 2490000, salePrice: 1690000, discount: 32 },
  { id: "fd-3", name: "Keyboard K87", originalPrice: 1690000, salePrice: 1190000, discount: 30 },
  { id: "fd-4", name: "Power Bank 20K", originalPrice: 890000, salePrice: 590000, discount: 34 }
];

/* ──────────────────────────────────────────────────── */
/*  Brands                                              */
/* ──────────────────────────────────────────────────── */
export const mockBrands: BrandItem[] = [
  { id: "b-1", name: "Apple" },
  { id: "b-2", name: "Samsung" },
  { id: "b-3", name: "Dell" },
  { id: "b-4", name: "ASUS" },
  { id: "b-5", name: "Sony" },
  { id: "b-6", name: "Xiaomi" },
  { id: "b-7", name: "LG" },
  { id: "b-8", name: "Logitech" }
];

/* ──────────────────────────────────────────────────── */
/*  Orders (User-side dummy data)                       */
/* ──────────────────────────────────────────────────── */
export const mockOrders: Order[] = [
  {
    id: "ORD-2026-1001",
    totalPrice: 27680000,
    status: OrderStatus.COMPLETED,
    paymentMethod: "MOMO",
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2026-03-15T10:30:00.000Z",
    items: [
      { id: "oi-1", quantity: 1, price: 25990000, product: mockProducts[0] },
      { id: "oi-2", quantity: 1, price: 1690000, product: mockProducts[5] }
    ]
  },
  {
    id: "ORD-2026-1002",
    totalPrice: 18990000,
    status: OrderStatus.PROCESSING,
    paymentMethod: "VNPAY",
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2026-03-16T14:20:00.000Z",
    items: [
      { id: "oi-3", quantity: 1, price: 18990000, product: mockProducts[2] }
    ]
  },
  {
    id: "ORD-2026-1003",
    totalPrice: 3380000,
    status: OrderStatus.PENDING,
    paymentMethod: "COD",
    paymentStatus: PaymentStatus.PENDING,
    createdAt: "2026-03-17T08:15:00.000Z",
    items: [
      { id: "oi-4", quantity: 1, price: 2490000, product: mockProducts[4] },
      { id: "oi-5", quantity: 1, price: 890000, product: mockProducts[7] }
    ]
  },
  {
    id: "ORD-2026-1004",
    totalPrice: 6990000,
    status: OrderStatus.CANCELLED,
    paymentMethod: "MOMO",
    paymentStatus: PaymentStatus.FAILED,
    createdAt: "2026-03-12T09:45:00.000Z",
    items: [
      { id: "oi-6", quantity: 1, price: 6990000, product: mockProducts[3] }
    ]
  }
];

/* ──────────────────────────────────────────────────── */
/*  Reviews                                             */
/* ──────────────────────────────────────────────────── */
export const mockReviews: ReviewItem[] = [
  {
    id: "r-1", userId: "u-1", userName: "Nguyễn Văn A", rating: 5,
    comment: "Sản phẩm tuyệt vời, rất đáng tiền. Đóng gói cẩn thận, giao hàng nhanh!",
    createdAt: "2026-03-10T08:00:00.000Z"
  },
  {
    id: "r-2", userId: "u-2", userName: "Trần Thị B", rating: 4,
    comment: "Chất lượng tốt, thiết kế đẹp. Pin hơi nhanh hết nhưng nhìn chung OK.",
    createdAt: "2026-03-12T14:30:00.000Z"
  },
  {
    id: "r-3", userId: "u-4", userName: "Phạm Thị D", rating: 5,
    comment: "Mua cho bạn tặng sinh nhật, bạn rất thích. Sẽ ủng hộ shop tiếp!",
    createdAt: "2026-03-14T11:00:00.000Z"
  },
  {
    id: "r-4", userId: "u-3", userName: "Lê Văn C", rating: 3,
    comment: "Sản phẩm ổn nhưng giá hơi cao so với thị trường. Dịch vụ hỗ trợ tốt.",
    createdAt: "2026-03-15T09:20:00.000Z"
  }
];

/* ──────────────────────────────────────────────────── */
/*  Admin — Revenue, Status, Users                      */
/* ──────────────────────────────────────────────────── */
export const adminRevenueSeries: AdminRevenuePoint[] = [
  { month: "T1", revenue: 380000000 },
  { month: "T2", revenue: 420000000 },
  { month: "T3", revenue: 510000000 },
  { month: "T4", revenue: 490000000 },
  { month: "T5", revenue: 620000000 },
  { month: "T6", revenue: 700000000 }
];

export const orderStatusShare: StatusShareItem[] = [
  { label: "Thành công", value: 64, color: "#22c55e" },
  { label: "Đang xử lý", value: 24, color: "#f59e0b" },
  { label: "Thất bại", value: 12, color: "#ef4444" }
];

export const adminUsersMock: AdminUserItem[] = [
  { id: "u-1", name: "Nguyễn Văn A", email: "a@example.com", role: "USER", createdAt: "2026-01-15" },
  { id: "u-2", name: "Trần Thị B", email: "b@example.com", role: "USER", createdAt: "2026-02-03" },
  { id: "u-3", name: "Lê Văn C", email: "c@example.com", role: "ADMIN", createdAt: "2025-12-01" },
  { id: "u-4", name: "Phạm Thị D", email: "d@example.com", role: "USER", createdAt: "2026-03-10" },
  { id: "u-5", name: "Hoàng Minh E", email: "e@example.com", role: "USER", createdAt: "2026-03-14" }
];

/* ──────────────────────────────────────────────────── */
/*  Admin — AI Insights                                 */
/* ──────────────────────────────────────────────────── */
export const mockAIInsights: AIInsightItem[] = [
  {
    id: "ai-1", type: "top-selling", title: "Sản phẩm bán chạy nhất",
    description: "Laptop Pro 14 2026 dẫn đầu doanh số tháng 3 với 48 đơn",
    value: "48 đơn", icon: "🏆", color: "#f59e0b", bgColor: "#fef3c7"
  },
  {
    id: "ai-2", type: "stock-alert", title: "Cảnh báo tồn kho",
    description: "Gaming Beast X còn 8 sản phẩm, cần nhập thêm hàng",
    value: "8 SP", icon: "⚠️", color: "#ef4444", bgColor: "#fee2e2"
  },
  {
    id: "ai-3", type: "revenue-trend", title: "Xu hướng doanh thu",
    description: "Doanh thu tăng 13% so với tháng trước, tiếp tục đà tăng trưởng",
    value: "+13%", icon: "📈", color: "#22c55e", bgColor: "#dcfce7"
  },
  {
    id: "ai-4", type: "category-analysis", title: "Danh mục tiềm năng",
    description: "Gaming Gear tăng 45% lượt truy cập, nên mở rộng sản phẩm",
    value: "+45%", icon: "🎮", color: "#3b82f6", bgColor: "#dbeafe"
  },
  {
    id: "ai-5", type: "customer-behavior", title: "Hành vi khách hàng",
    description: "70% khách hàng quay lại mua lần 2 trong vòng 30 ngày",
    value: "70%", icon: "🔄", color: "#8b5cf6", bgColor: "#ede9fe"
  },
  {
    id: "ai-6", type: "recommendation", title: "Gợi ý combo",
    description: "Combo Laptop + Tai nghe + Bàn phím tăng AOV lên 28%",
    value: "+28% AOV", icon: "💡", color: "#f97316", bgColor: "#fff7ed"
  }
];

/* ──────────────────────────────────────────────────── */
/*  Helper functions                                    */
/* ──────────────────────────────────────────────────── */
export function getCategoryBySlug(slug: string) {
  return productCategories.find((c) => c.slug === slug);
}

export function getCategorySlugById(categoryId: string) {
  return productCategories.find((c) => c.id === categoryId)?.slug;
}

export function getProductById(productId: string) {
  return mockProducts.find((p) => p.id === productId);
}

export function getProductsByCategory(slug: string) {
  const category = getCategoryBySlug(slug);
  if (!category) return [];
  return mockProducts.filter((p) => p.category?.id === category.id);
}

export function getOrderStatusIndex(status: string): number {
  const steps = ["PENDING", "PROCESSING", "COMPLETED"];
  return steps.indexOf(status);
}
