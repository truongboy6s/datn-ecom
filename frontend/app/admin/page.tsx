"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { OrderStatusChart } from "@/components/charts/OrderStatusChart";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { adminService } from "@/services/admin.service";
import type { AdminRevenuePoint, StatusShareItem } from "@/types/admin";
import { OrderStatus, type Order } from "@/types/domain";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({ revenue: 0, totalOrders: 0, totalUsers: 0, topProduct: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueSeries, setRevenueSeries] = useState<AdminRevenuePoint[]>([]);
  const [statusShare, setStatusShare] = useState<StatusShareItem[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([adminService.getMetrics(), adminService.listOrders()])
      .then(([metricsRes, ordersRes]) => {
        if (!active) return;
        const safeMetrics = metricsRes
          ? { ...metricsRes, topProduct: metricsRes.topProduct || "" }
          : { revenue: 0, totalOrders: 0, totalUsers: 0, topProduct: "" };
        setMetrics(safeMetrics);
        const safeOrders = ordersRes || [];
        setOrders(safeOrders);
        setRevenueSeries(buildRevenueSeries(safeOrders));
        setStatusShare(buildStatusShare(safeOrders));
      })
      .catch(() => {
        if (!active) return;
        setOrders([]);
        setRevenueSeries(buildRevenueSeries([]));
        setStatusShare(buildStatusShare([]));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const latestOrders = orders.slice(0, 3);

  return (
    <>
      <h1>📊 Dashboard</h1>
      <p className="page-subtitle">Tổng quan doanh thu, đơn hàng và hiệu suất vận hành.</p>

      <div className="stat-grid">
        <StatCard
          label="Doanh thu tháng"
          value={metrics.revenue.toLocaleString("vi-VN") + "₫"}
          icon="💰"
          iconBg="#fff7ed"
          iconColor="#f97316"
          trend="+12% vs tháng trước"
          trendDirection="up"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={metrics.totalOrders.toString()}
          icon="📦"
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          trend="+8% vs tháng trước"
          trendDirection="up"
        />
        <StatCard
          label="Tổng người dùng"
          value={metrics.totalUsers.toString()}
          icon="👥"
          iconBg="#f0fdf4"
          iconColor="#22c55e"
          trend="+24 user mới"
          trendDirection="up"
        />
        <StatCard
          label="Top sản phẩm"
          value={metrics.topProduct || "-"}
          icon="🏆"
          iconBg="#fef3c7"
          iconColor="#f59e0b"
        />
      </div>

      <div className="chart-grid">
        <RevenueBarChart data={revenueSeries} />
        <OrderStatusChart data={statusShare} />
      </div>

      {/* Latest Orders */}
      <div style={{ marginTop: 24 }}>
        <div className="section-block__header">
          <h2>📋 Đơn hàng gần đây</h2>
          <Link href="/admin/orders" style={{ color: "var(--brand)", fontWeight: 600, fontSize: ".9rem" }}>
            Xem tất cả →
          </Link>
        </div>
        <table className="table-block">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {latestOrders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.totalPrice.toLocaleString("vi-VN")}₫</td>
                <td>
                  <span className={`status-chip status-chip--${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className={`status-chip status-chip--${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
            {!loading && latestOrders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "16px" }}>
                  Chưa có dữ liệu đơn hàng.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 24 }}>
        <h2>⚡ Hành động nhanh</h2>
        <div className="actions-row">
          <Link href="/admin/products" className="btn-primary">+ Thêm sản phẩm</Link>
          <Link href="/admin/orders" className="btn-outline">📋 Xử lý đơn hàng</Link>
          <Link href="/admin/ai-insights" className="btn-outline">🤖 Xem AI phân tích</Link>
        </div>
      </div>
    </>
  );
}

function buildRevenueSeries(orders: Order[], months: number = 6): AdminRevenuePoint[] {
  const now = new Date();
  const points: AdminRevenuePoint[] = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const revenue = orders.reduce((sum, order) => {
      const createdAt = new Date(order.createdAt);
      if (createdAt.getMonth() === month && createdAt.getFullYear() === year) {
        return sum + order.totalPrice;
      }
      return sum;
    }, 0);

    points.push({ month: `T${month + 1}`, revenue });
  }

  return points;
}

function buildStatusShare(orders: Order[]): StatusShareItem[] {
  const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    [OrderStatus.COMPLETED]: { label: "Thành công", color: "#22c55e" },
    [OrderStatus.PROCESSING]: { label: "Đang xử lý", color: "#f59e0b" },
    [OrderStatus.PENDING]: { label: "Chờ xử lý", color: "#60a5fa" },
    [OrderStatus.CANCELLED]: { label: "Đã hủy", color: "#ef4444" },
  };

  const counts = orders.reduce(
    (acc, order) => {
      acc[order.status] += 1;
      return acc;
    },
    {
      [OrderStatus.COMPLETED]: 0,
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CANCELLED]: 0,
    }
  );

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const statuses: OrderStatus[] = [
    OrderStatus.COMPLETED,
    OrderStatus.PROCESSING,
    OrderStatus.PENDING,
    OrderStatus.CANCELLED,
  ];

  let remaining = 100;
  return statuses.map((status, index) => {
    const baseValue = total === 0 ? 0 : Math.round((counts[status] / total) * 100);
    const value = index === statuses.length - 1 ? Math.max(remaining, 0) : baseValue;
    remaining -= value;
    return {
      label: statusConfig[status].label,
      value,
      color: statusConfig[status].color,
    };
  });
}
