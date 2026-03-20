"use client";

import { useEffect, useState } from "react";
import {
  type Order,
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_VIETNAMESE,
  PAYMENT_STATUS_VIETNAMESE,
} from "@/types/domain";
import { adminService } from "@/services/admin.service";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService
      .listOrders()
      .then((data) => {
        if (!active) return;
        setOrders(data || []);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Lỗi khi tải đơn hàng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const updated = await adminService.updateOrder(id, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật trạng thái đơn hàng.");
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: Order["paymentStatus"]) => {
    try {
      const updated = await adminService.updateOrder(id, { paymentStatus });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật trạng thái thanh toán.");
    }
  };

  function getStatusStyle(status: string) {
    const s = status.toLowerCase();
    return `status-chip status-chip--${s}`;
  }

  return (
    <>
      <h1>📋 Quản lý đơn hàng</h1>
      <p className="page-subtitle">Theo dõi, xử lý và cập nhật trạng thái đơn hàng trực tiếp.</p>
      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      <table className="table-block">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Tổng tiền</th>
            <th>Phương thức</th>
            <th>Trạng thái đặt hàng</th>
            <th>Trạng thái thanh toán</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                Đang tải đơn hàng...
              </td>
            </tr>
          ) : orders.map((order) => (
            <tr key={order.id}>
              <td>
                <strong>{order.id}</strong>
              </td>
              <td>{order.totalPrice.toLocaleString("vi-VN")}₫</td>
              <td>
                <span className="status-chip status-chip--info">{order.paymentMethod}</span>
              </td>
              <td>
                <select
                  className={getStatusStyle(order.status)}
                  style={{ border: "none", cursor: "pointer", fontWeight: 600 }}
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                >
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_VIETNAMESE[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className={getStatusStyle(order.paymentStatus)}
                  style={{ border: "none", cursor: "pointer", fontWeight: 600 }}
                  value={order.paymentStatus}
                  onChange={(e) =>
                    updatePaymentStatus(order.id, e.target.value as Order["paymentStatus"])
                  }
                >
                  {Object.values(PaymentStatus).map((status) => (
                    <option key={status} value={status}>
                      {PAYMENT_STATUS_VIETNAMESE[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
