"use client";

import { useEffect, useState } from "react";
import { Modal, ConfirmDialog } from "@/components/common/Modal";
import type { AdminUserItem } from "@/types/admin";
import { adminService } from "@/services/admin.service";

function roleBadgeClass(role: string) {
  return role === "ADMIN" ? "status-chip status-chip--admin" : "status-chip status-chip--user";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Form states
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService
      .listUsers()
      .then((data) => {
        if (!active) return;
        setUsers(data || []);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Lỗi tải danh sách người dùng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditRole = (user: AdminUserItem) => {
    setEditingUser(user);
    setNewRole(user.role);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      try {
        const updated = await adminService.updateUserRole(editingUser.id, newRole as "USER" | "ADMIN");
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, role: updated.role } : u));
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật quyền người dùng.");
        return;
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await adminService.deleteUser(userToDelete);
        setUsers(prev => prev.filter(u => u.id !== userToDelete));
      } catch (err: any) {
        setError(err.message || "Lỗi xóa người dùng.");
      }
    }
  };

  return (
    <>
      <h1>👥 Quản lý người dùng</h1>
      <p className="page-subtitle">Danh sách tài khoản và quyền truy cập hệ thống.</p>

      <div className="table-toolbar">
        <input 
          className="table-search" 
          placeholder="🔍 Tìm theo tên hoặc email..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      <table className="table-block">
        <thead>
          <tr>
            <th></th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Ngày tham gia</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                Đang tải người dùng...
              </td>
            </tr>
          ) : filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <span className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </td>
              <td><strong>{user.name}</strong></td>
              <td style={{ color: "var(--muted)" }}>{user.email}</td>
              <td>
                <span className={roleBadgeClass(user.role)}>{user.role}</span>
              </td>
              <td style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-icon" title="Sửa quyền" onClick={() => handleEditRole(user)}>
                    🔑
                  </button>
                  <button className="btn-icon btn-icon--danger" title="Xóa" onClick={() => handleDeleteClick(user.id)}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Role Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Sửa quyền người dùng"
      >
        <form className="admin-form" onSubmit={handleSaveRole}>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--muted)" }}>Người dùng:</p>
            <strong>{editingUser?.name} ({editingUser?.email})</strong>
          </div>
          <label>
            Vai trò
            <select 
              value={newRole} 
              onChange={e => setNewRole(e.target.value)}
              required
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Cập nhật</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa người dùng"
        message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này sẽ thu hồi toàn bộ quyền truy cập."
        confirmLabel="Xóa ngay"
        danger
      />
    </>
  );
}
