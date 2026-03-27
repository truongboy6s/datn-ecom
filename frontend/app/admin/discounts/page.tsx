"use client";

import { useEffect, useState } from "react";
import type { Discount } from "@/types/domain";
import { adminService } from "@/services/admin.service";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    description: string;
    discount: number;
    discountType: "percentage" | "fixed";
    maxUses: number | null;
    expiresAt: string;
  }>({
    code: "",
    description: "",
    discount: 0,
    discountType: "percentage",
    maxUses: null,
    expiresAt: "",
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService
      .listDiscounts()
      .then((res) => {
        if (!active) return;
        setDiscounts(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Lỗi khi tải mã giảm giá.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount: 0,
      discountType: "percentage",
      maxUses: null,
      expiresAt: "",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleOpenForm = (discount?: Discount) => {
    if (discount) {
      setFormData({
        code: discount.code,
        description: discount.description || "",
        discount: discount.discount,
        discountType: discount.discountType,
        maxUses: typeof discount.maxUses === "number" ? discount.maxUses : null,
        expiresAt: discount.expiresAt ? discount.expiresAt.slice(0, 10) : "",
      });
      setEditingId(discount.id);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || formData.discount <= 0) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      if (editingId) {
        const updated = await adminService.updateDiscount(editingId, {
          description: formData.description,
          discount: formData.discount,
          discountType: formData.discountType,
          maxUses: formData.maxUses,
          expiresAt: formData.expiresAt || null,
        });
        setDiscounts(discounts.map((d) => (d.id === editingId ? updated : d)));
      } else {
        const created = await adminService.createDiscount({
          code: formData.code,
          description: formData.description,
          discount: formData.discount,
          discountType: formData.discountType,
          maxUses: formData.maxUses,
          expiresAt: formData.expiresAt || null,
          isActive: true,
        });
        setDiscounts([created, ...discounts]);
      }
      setError(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Lỗi lưu mã giảm giá.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      return;
    }
    try {
      await adminService.deleteDiscount(id);
      setDiscounts(discounts.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message || "Lỗi xóa mã giảm giá.");
    }
  };

  const toggleActive = async (id: string) => {
    const target = discounts.find((d) => d.id === id);
    if (!target) return;
    try {
      const updated = await adminService.updateDiscount(id, { isActive: !target.isActive });
      setDiscounts(discounts.map((d) => (d.id === id ? updated : d)));
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật trạng thái mã giảm giá.");
    }
  };

  return (
    <>
      <h1>🎟️ Quản lý mã giảm giá</h1>
      <p className="page-subtitle">
        Tạo, quản lý và theo dõi hiệu quả của các mã giảm giá. Tổng: {discounts.length} mã
      </p>
      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      {/* Form Section */}
      <div className="card-block">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2>{editingId ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}</h2>
          {isFormOpen && (
            <button onClick={resetForm} className="btn btn-outline btn-sm">
              ✕ Đóng
            </button>
          )}
        </div>

        {isFormOpen ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label>Mã giảm giá *</label>
              <input
                type="text"
                placeholder="Ví dụ: SUMMER20"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={!!editingId}
              />
            </div>

            <div className="form-group">
              <label>Loại giảm</label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })
                }
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Giá trị giảm *</label>
              <input
                type="number"
                placeholder={formData.discountType === "percentage" ? "Ví dụ: 10" : "Ví dụ: 50000"}
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label>Số lượng sử dụng tối đa</label>
              <input
                type="number"
                placeholder="Để trống = không giới hạn"
                value={formData.maxUses || ""}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Mô tả</label>
              <textarea
                placeholder="Mô tả cho mã giảm giá (hiển thị cho khách hàng)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="form-group">
              <label>Ngày hết hạn</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-outline" style={{ flex: 1 }}>
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => handleOpenForm()} className="btn btn-primary">
            + Thêm mã giảm giá mới
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="card-block">
        <h2 style={{ marginBottom: 16 }}>Danh sách mã giảm giá</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table-block">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Mô tả</th>
                <th>Giảm giá</th>
                <th>Lượt dùng</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "center", width: 140 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                    Đang tải mã giảm giá...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ fontSize: "2.4rem", margin: "0 0 10px" }}>🎟️</p>
                    <h3 style={{ margin: "0 0 8px" }}>Trống</h3>
                    <p style={{ color: "var(--muted)", margin: 0 }}>Chưa có mã giảm giá nào.</p>
                  </td>
                </tr>
              ) : discounts.map((discount) => (
                <tr key={discount.id}>
                  <td>
                    <strong style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>
                      {discount.code}
                    </strong>
                  </td>
                  <td style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                    {discount.description || "—"}
                  </td>
                  <td>
                    <span
                      style={{
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        color: "#3b82f6",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      {discount.discountType === "percentage"
                        ? `${discount.discount}%`
                        : `${discount.discount.toLocaleString("vi-VN")} VNĐ`}
                    </span>
                  </td>
                  <td>
                    {discount.maxUses
                      ? `${discount.usesCount}/${discount.maxUses}`
                      : `${discount.usesCount}`}
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>
                    {discount.expiresAt
                      ? new Date(discount.expiresAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        discount.isActive ? "status-chip--success" : "status-chip--neutral"
                      }`}
                    >
                      {discount.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button
                        onClick={() => handleOpenForm(discount)}
                        className="btn btn-sm"
                        title="Chỉnh sửa"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => toggleActive(discount.id)}
                        className={`btn btn-sm ${discount.isActive ? "btn-outline" : ""}`}
                        title={discount.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {discount.isActive ? "⊗" : "✓"}
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="btn btn-sm"
                        title="Xóa"
                        style={{ color: "#ef4444" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
