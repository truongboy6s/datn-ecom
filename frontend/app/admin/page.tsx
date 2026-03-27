"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { OrderStatusChart } from "@/components/charts/OrderStatusChart";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { adminService } from "@/services/admin.service";
import type { AdminRevenuePoint, StatusShareItem } from "@/types/admin";
import { OrderStatus, type Order, ORDER_STATUS_VIETNAMESE, PAYMENT_STATUS_VIETNAMESE } from "@/types/domain";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    revenueToday: 0,
    revenueYesterday: 0,
    totalOrders: 0,
    ordersToday: 0,
    ordersYesterday: 0,
    totalUsers: 0,
    usersToday: 0,
    usersYesterday: 0,
    topProduct: "",
  });
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
          : {
              revenueToday: 0,
              revenueYesterday: 0,
              totalOrders: 0,
              ordersToday: 0,
              ordersYesterday: 0,
              totalUsers: 0,
              usersToday: 0,
              usersYesterday: 0,
              topProduct: "",
            };
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

  const calcTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? "+100% vs hôm qua" : "0% vs hôm qua";
    const diff = ((today - yesterday) / yesterday) * 100;
    const prefix = diff > 0 ? "+" : "";
    return `${prefix}${diff.toFixed(1)}% vs hôm qua`;
  };

  const revenueTrend = calcTrend(metrics.revenueToday, metrics.revenueYesterday);
  const revenueDir = metrics.revenueToday >= metrics.revenueYesterday ? "up" : "down";

  const ordersTrend = calcTrend(metrics.ordersToday, metrics.ordersYesterday);
  const ordersDir = metrics.ordersToday >= metrics.ordersYesterday ? "up" : "down";

  const usersTrend = `+${metrics.usersToday} user hôm nay`;
  const usersDir = metrics.usersToday >= metrics.usersYesterday ? "up" : "down";

  return (
    <>
      <h1>📊 Dashboard</h1>
      <p className="page-subtitle">Tổng quan doanh thu, đơn hàng và hiệu suất vận hành.</p>

      <div className="stat-grid">
        <StatCard
          label="Doanh thu ngày"
          value={metrics.revenueToday.toLocaleString("vi-VN") + " VNĐ"}
          icon="💰"
          iconBg="#fff7ed"
          iconColor="#f97316"
          trend={revenueTrend}
          trendDirection={revenueDir}
        />
        <StatCard
          label="Tổng đơn hàng"
          value={metrics.totalOrders.toString()}
          icon="📦"
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          trend={ordersTrend}
          trendDirection={ordersDir}
        />
        <StatCard
          label="Tổng người dùng"
          value={metrics.totalUsers.toString()}
          icon="👥"
          iconBg="#f0fdf4"
          iconColor="#22c55e"
          trend={usersTrend}
          trendDirection={usersDir}
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
                    {ORDER_STATUS_VIETNAMESE[order.status] || order.status}
                  </span>
                </td>
                <td>
                  <span className={`status-chip status-chip--${order.paymentStatus.toLowerCase()}`}>
                    {PAYMENT_STATUS_VIETNAMESE[order.paymentStatus] || order.paymentStatus}
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
    [OrderStatus.DELIVERED]: { label: "Đã giao", color: "#22c55e" },
    [OrderStatus.SHIPPING]: { label: "Đang giao", color: "#f59e0b" },
    [OrderStatus.CONFIRMED]: { label: "Đã xác nhận", color: "#3b82f6" },
    [OrderStatus.PENDING]: { label: "Chờ xác nhận", color: "#fbbf24" },
    [OrderStatus.CANCELLED]: { label: "Đã hủy", color: "#ef4444" },
  };

  const counts = orders.reduce(
    (acc, order) => {
      acc[order.status] += 1;
      return acc;
    },
    {
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.SHIPPING]: 0,
      [OrderStatus.CONFIRMED]: 0,
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CANCELLED]: 0,
    }
  );

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const statuses: OrderStatus[] = [
    OrderStatus.DELIVERED,
    OrderStatus.SHIPPING,
    OrderStatus.CONFIRMED,
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
