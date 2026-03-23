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
